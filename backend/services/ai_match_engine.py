import os
import math
from typing import Dict, Any, List
from database import supabase

# Lazy loading of SentenceTransformer
_model = None

def get_sentence_transformer_model():
    """
    Load the SentenceTransformer model lazily to optimize startup.
    """
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            print("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Warning: Failed to load SentenceTransformer: {e}. Falling back to keyword-matching similarity.")
            _model = None
    return _model

def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

def magnitude(v):
    return math.sqrt(sum(x * x for x in v))

def cosine_similarity(v1, v2):
    mag1 = magnitude(v1)
    mag2 = magnitude(v2)
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product(v1, v2) / (mag1 * mag2)

class AIMatchEngine:
    @staticmethod
    def calculate_match_scores(candidate_id: str, job_id: str) -> Dict[str, Any]:
        """
        Retrieves candidate and job coordinates from database, calculates similarity embeddings,
        updates candidate_rankings, and returns score breakdown.
        """
        # 1. Fetch Candidate Data
        candidate = {}
        skills = []
        education = []
        experience = []
        projects = []
        
        try:
            cand_res = supabase.table("candidates").select("*").eq("id", candidate_id).execute()
            if cand_res.data:
                candidate = cand_res.data[0]
            
            # Fetch skills
            skills_res = (
                supabase.table("candidate_skills")
                .select("skills(name)")
                .eq("candidate_id", candidate_id)
                .execute()
            )
            skills = [s["skills"]["name"] for s in skills_res.data if s.get("skills")]
            
            # Fetch education
            edu_res = supabase.table("education").select("*").eq("candidate_id", candidate_id).execute()
            education = edu_res.data or []
            
            # Fetch experience
            exp_res = supabase.table("experience").select("*").eq("candidate_id", candidate_id).execute()
            experience = exp_res.data or []
            
            # Fetch projects
            proj_res = supabase.table("projects").select("*").eq("candidate_id", candidate_id).execute()
            projects = proj_res.data or []
        except Exception as e:
            print(f"Error fetching candidate details for AI Match: {e}")

        # 2. Fetch Job Data
        job = {}
        try:
            job_res = supabase.table("jobs").select("*").eq("id", job_id).execute()
            if job_res.data:
                job = job_res.data[0]
        except Exception as e:
            print(f"Error fetching job details for AI Match: {e}")

        if not job:
            return {
                "skills_score": 0.0,
                "experience_score": 0.0,
                "education_score": 0.0,
                "overall_score": 0.0,
                "recommendation": "Job details not found"
            }

        # 3. Formulate Text Corpora
        job_title = job.get("title", "")
        job_desc = job.get("description", "")
        job_reqs = job.get("requirements", "")
        job_skills = job.get("skills_required", "")

        cand_summary = candidate.get("summary") or ""
        cand_skills_str = ", ".join(skills)
        cand_edu_str = " ".join([f"{e.get('degree')} from {e.get('institution')}." for e in education])
        cand_exp_str = " ".join([f"{ex.get('title')} at {ex.get('company')}: {ex.get('description')}." for ex in experience])
        cand_proj_str = " ".join([f"{p.get('title')}: {p.get('description')}." for p in projects])

        # Overall texts
        job_overall_text = f"{job_title} {job_desc} {job_reqs} {job_skills}"
        cand_overall_text = f"{cand_summary} {cand_skills_str} {cand_edu_str} {cand_exp_str} {cand_proj_str}"

        # Initialize Default Scores
        skills_score = 0.5
        experience_score = 0.5
        education_score = 0.5
        overall_score = 0.5

        # 4. Compute Similarities
        model = get_sentence_transformer_model()
        if model:
            try:
                # Overall Match Score
                job_emb = model.encode(job_overall_text).tolist()
                cand_emb = model.encode(cand_overall_text).tolist()
                overall_score = max(0.0, min(1.0, cosine_similarity(job_emb, cand_emb)))

                # Skills Score
                job_skills_emb = model.encode(job_skills or "Skills").tolist()
                cand_skills_emb = model.encode(cand_skills_str or "Skills").tolist()
                skills_score = max(0.0, min(1.0, cosine_similarity(job_skills_emb, cand_skills_emb)))

                # Experience Score
                job_reqs_emb = model.encode(job_reqs or "Requirements").tolist()
                cand_exp_emb = model.encode(cand_exp_str or "Experience").tolist()
                experience_score = max(0.0, min(1.0, cosine_similarity(job_reqs_emb, cand_exp_emb)))

                # Education Score
                job_edu_emb = model.encode(job_desc or "Education").tolist()
                cand_edu_emb = model.encode(cand_edu_str or "Education").tolist()
                education_score = max(0.0, min(1.0, cosine_similarity(job_edu_emb, cand_edu_emb)))
            except Exception as e:
                print(f"Error executing model encoding: {e}. Falling back to keyword matching.")
                model = None

        if not model:
            # Simple keyword matching fallback
            def keyword_similarity(text1: str, text2: str) -> float:
                words1 = set(re.findall(r'\w+', text1.lower()))
                words2 = set(re.findall(r'\w+', text2.lower()))
                if not words1 or not words2:
                    return 0.0
                intersection = words1.intersection(words2)
                return len(intersection) / math.sqrt(len(words1) * len(words2))

            overall_score = keyword_similarity(job_overall_text, cand_overall_text)
            skills_score = keyword_similarity(job_skills or "", cand_skills_str)
            experience_score = keyword_similarity(job_reqs or "", cand_exp_str)
            education_score = keyword_similarity(job_desc or "", cand_edu_str)

        # Scale scores to 0-100 range
        skills_score = round(skills_score * 100, 1)
        experience_score = round(experience_score * 100, 1)
        education_score = round(education_score * 100, 1)
        overall_score = round(overall_score * 100, 1)

        # Ensure reasonable bounds for score display
        skills_score = max(10.0, min(100.0, skills_score))
        experience_score = max(10.0, min(100.0, experience_score))
        education_score = max(10.0, min(100.0, education_score))
        overall_score = max(10.0, min(100.0, overall_score))

        # 5. Formulate Recommendation
        if overall_score >= 85:
            rec = "Strong Candidate Match"
        elif overall_score >= 70:
            rec = "Suitable Match"
        elif overall_score >= 50:
            rec = "Keep on File"
        else:
            rec = "Unsuitable Match"

        # 6. Save/Upsert into candidate_rankings
        try:
            supabase.table("candidate_rankings").upsert({
                "candidate_id": candidate_id,
                "job_id": job_id,
                "score": overall_score,
                "rank": None # Will be recalculated by ranking_service
            }).execute()
        except Exception as e:
            print(f"Error saving score to candidate_rankings: {e}")

        return {
            "skills_score": skills_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "overall_score": overall_score,
            "recommendation": rec
        }
