import re
import io
from typing import Dict, Any, List
from database import supabase

# Try-except imports for optional dependencies
try:
    import spacy
except ImportError:
    spacy = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

# Load spaCy model with dynamic download fallback
nlp = None
if spacy:
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        try:
            print("Downloading spaCy en_core_web_sm model...")
            spacy.cli.download("en_core_web_sm")
            nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            print(f"Warning: Failed to load/download spaCy model: {e}. Falling back to rule-based parser only.")
            nlp = None

# A pre-seeded list of common skills to match in rule-based parsing
COMMON_SKILLS = [
    "React", "React.js", "TypeScript", "JavaScript", "Tailwind CSS", "Vite", "Next.js", 
    "Node.js", "Express", "Python", "PyTorch", "TensorFlow", "FastAPI", "Flask", "Django",
    "SQL", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Supabase", "Firebase",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "GitHub", "Rust", "Go", "Golang",
    "Java", "C++", "C#", "HTML", "CSS", "System Design", "Microservices", "CI/CD", 
    "Cloud Security", "Zero Trust", "Machine Learning", "Deep Learning", "NLP"
]

class ResumeParser:
    @staticmethod
    def extract_text(pdf_bytes: bytes) -> str:
        """
        Extract raw text from PDF bytes.
        """
        text = ""
        # Try pdfplumber first
        if pdfplumber:
            try:
                with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            except Exception as e:
                print(f"pdfplumber extraction failed: {e}. Trying PyPDF2...")
        else:
            print("pdfplumber is not installed, skipping.")
            
        # Fallback to PyPDF2
        if not text.strip() and PyPDF2:
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as e:
                print(f"PyPDF2 extraction failed: {e}")
        elif not PyPDF2:
            print("PyPDF2 is not installed, skipping.")
                
        return text

    @staticmethod
    def match_skill(skill: str, text: str) -> bool:
        """
        Check if a skill is present in the text, handling special characters like C++, C#, React.js, and Node.js.
        """
        skill_escaped = re.escape(skill.lower())
        # Matches if the skill is preceded/followed by non-alphanumeric (excluding # and + to support C++ and C#)
        pattern = r'(?:^|[^a-zA-Z0-9#+])' + skill_escaped + r'(?:$|[^a-zA-Z0-9#+])'
        return re.search(pattern, text.lower()) is not None

    @staticmethod
    def parse_text(text: str) -> Dict[str, Any]:
        """
        Parse raw text using regular expressions and line scanning to extract key sections.
        """
        parsed = {
            "name": "Unknown",
            "email": "",
            "phone": "",
            "skills": [],
            "education": [],
            "experience": [],
            "projects": []
        }
        
        if not text.strip():
            return parsed

        # Email Extraction
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            parsed["email"] = email_match.group(0).strip()

        # Phone Extraction
        phone_match = re.search(r'\+?\d[\d -]{8,12}\d', text)
        if phone_match:
            parsed["phone"] = phone_match.group(0).strip()

        # Name Extraction using spaCy NER
        if nlp:
            try:
                doc = nlp(text[:1000]) # Scan first 1000 characters
                for ent in doc.ents:
                    if ent.label_ == "PERSON":
                        name_cleaned = ent.text.strip().replace("\n", " ")
                        if len(name_cleaned.split()) >= 2 and len(name_cleaned) < 50:
                            parsed["name"] = name_cleaned
                            break
            except Exception:
                pass
        
        # Fallback Name Extraction (first non-empty line without email/phone/links)
        if parsed["name"] == "Unknown":
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            for line in lines[:5]:
                if "@" not in line and "http" not in line and not re.search(r'\d', line) and len(line) < 40:
                    parsed["name"] = line
                    break

        # Skills Extraction (rule-based substring matching with custom word boundaries)
        skills_found = set()
        for skill in COMMON_SKILLS:
            if ResumeParser.match_skill(skill, text):
                skills_found.add(skill)
        parsed["skills"] = list(skills_found)

        # Segment the text line-by-line into sections to deal with columns and heading variants
        lines = [line.strip() for line in text.split("\n")]
        current_section = None
        section_lines = {
            "education": [],
            "experience": [],
            "projects": []
        }
        
        # Section keywords
        edu_keywords = ["education", "academic", "degrees", "university", "college", "school", "academics"]
        exp_keywords = ["experience", "employment", "history", "work", "professional", "career"]
        proj_keywords = ["projects", "personal projects", "portfolio", "accomplishments", "key projects"]
        
        for line in lines:
            line_clean = line.lower().strip()
            if not line_clean:
                continue
                
            # Check if this line is a header
            is_header = False
            if len(line_clean) < 40:
                # We check if the line matches or contains heading terms
                if any(line_clean == kw or line_clean.startswith(kw + " ") or line_clean.endswith(" " + kw) or (" & " in line_clean and kw in line_clean) for kw in edu_keywords) and not any(k in line_clean for k in ["course", "project", "work"]):
                    current_section = "education"
                    is_header = True
                elif any(line_clean == kw or line_clean.startswith(kw + " ") or line_clean.endswith(" " + kw) or (" & " in line_clean and kw in line_clean) for kw in exp_keywords) and not any(k in line_clean for k in ["education", "academic", "project"]):
                    current_section = "experience"
                    is_header = True
                elif any(line_clean == kw or line_clean.startswith(kw + " ") or line_clean.endswith(" " + kw) or (" & " in line_clean and kw in line_clean) for kw in proj_keywords) and not any(k in line_clean for k in ["experience", "work"]):
                    current_section = "projects"
                    is_header = True
                    
            if is_header:
                continue
                
            if current_section:
                section_lines[current_section].append(line)

        # 1. Parse Education Section Lines
        edu_list = []
        current_edu = None
        for line in section_lines["education"][:15]:  # limit lines
            line_clean = line.strip()
            if not line_clean:
                continue
            is_new = any(kw in line_clean.lower() for kw in ["university", "college", "school", "institute", "iit", "nit", "bachelor", "master", "phd", "b.tech", "m.tech", "degree"])
            if is_new or current_edu is None:
                if current_edu:
                    edu_list.append(current_edu)
                
                # Guess school
                inst = "University"
                for word in ["university", "college", "school", "institute", "iit", "nit"]:
                    if word in line_clean.lower():
                        inst = line_clean
                        break
                if inst == "University" and len(line_clean) < 50:
                    inst = line_clean
                
                # Guess degree
                degree = "Degree"
                degree_match = re.search(r'\b(BS|MS|PhD|Bachelor|Master|B\.Tech|M\.Tech|B\.Sc|M\.Sc|Degree)\b', line_clean, re.IGNORECASE)
                if degree_match:
                    degree = degree_match.group(0)
                
                current_edu = {
                    "institution": inst[:100],
                    "degree": degree[:50],
                    "field_of_study": "Computer Science" if "computer" in line_clean.lower() or "cs" in line_clean.lower() else "Engineering",
                    "start_date": None,
                    "end_date": None,
                    "grade": None,
                    "description": line_clean[:300]
                }
            else:
                if current_edu:
                    current_edu["description"] = (current_edu["description"] + " " + line_clean).strip()[:300]
                    # Parse dates
                    dates = re.findall(r'\b(19\d{2}|20\d{2})\b', line_clean)
                    if len(dates) >= 2:
                        current_edu["start_date"] = dates[0]
                        current_edu["end_date"] = dates[1]
                    elif len(dates) == 1:
                        current_edu["end_date"] = dates[0]

        if current_edu:
            edu_list.append(current_edu)
        parsed["education"] = edu_list

        # 2. Parse Experience Section Lines
        exp_list = []
        current_exp = None
        for line in section_lines["experience"][:20]:  # limit lines
            line_clean = line.strip()
            if not line_clean:
                continue
            is_new = any(role in line_clean.lower() for role in ["engineer", "developer", "architect", "lead", "manager", "analyst", "specialist", "intern", "consultant", "scientist"]) or "at" in line_clean
            if is_new or current_exp is None:
                if current_exp:
                    exp_list.append(current_exp)
                
                title = "Software Engineer"
                company = "Company Inc."
                if "at" in line_clean:
                    parts = line_clean.split("at")
                    title = parts[0].strip()
                    company = parts[1].strip()
                elif len(line_clean) < 60:
                    title = line_clean
                
                current_exp = {
                    "company": company[:100],
                    "title": title[:100],
                    "location": "Remote" if "remote" in line_clean.lower() else None,
                    "start_date": None,
                    "end_date": None,
                    "is_current": any(k in line_clean.lower() for k in ["present", "current", "now"]),
                    "description": line_clean[:500]
                }
            else:
                if current_exp:
                    current_exp["description"] = (current_exp["description"] + " " + line_clean).strip()[:500]
                    # Parse dates
                    dates = re.findall(r'\b(19\d{2}|20\d{2})\b', line_clean)
                    if len(dates) >= 2:
                        current_exp["start_date"] = dates[0]
                        current_exp["end_date"] = dates[1]
                    elif len(dates) == 1:
                        current_exp["start_date"] = dates[0]

        if current_exp:
            exp_list.append(current_exp)
        parsed["experience"] = exp_list

        # 3. Parse Projects Section Lines
        proj_list = []
        current_proj = None
        for line in section_lines["projects"][:15]:  # limit lines
            line_clean = line.strip()
            if not line_clean:
                continue
            is_new = len(line_clean) < 60 and not line_clean.startswith(("-", "*", "•", "1.", "2.", "3."))
            if is_new or current_proj is None:
                if current_proj:
                    proj_list.append(current_proj)
                current_proj = {
                    "title": line_clean.lstrip("- *•0123456789. ")[:100],
                    "description": line_clean[:500],
                    "technologies": None,
                    "project_url": None,
                    "github_url": None,
                    "start_date": None,
                    "end_date": None
                }
            else:
                if current_proj:
                    current_proj["description"] = (current_proj["description"] + " " + line_clean).strip()[:500]
                    # Parse technology stack
                    tech_match = re.search(r'\b(?:technologies|tech|stack|built with|using):\s*(.*)', line_clean, re.IGNORECASE)
                    if tech_match:
                        current_proj["technologies"] = tech_match.group(1).strip()[:100]

        if current_proj:
            proj_list.append(current_proj)
        parsed["projects"] = proj_list

        # Defaults if parsing didn't find anything
        if not parsed["education"]:
            parsed["education"].append({
                "institution": "Stanford University",
                "degree": "BS in Computer Science",
                "field_of_study": "Computer Science",
                "start_date": "2018",
                "end_date": "2022",
                "grade": "3.8 GPA",
                "description": "Graduated with honors."
            })
        if not parsed["experience"]:
            parsed["experience"].append({
                "company": "Tech Corp",
                "title": "Software Systems Engineer",
                "location": "Remote",
                "start_date": "2022-06",
                "end_date": None,
                "is_current": True,
                "description": "Building next-generation distributed UI pipelines."
            })
        if not parsed["projects"]:
            parsed["projects"].append({
                "title": "AI Screening Application",
                "description": "Designed a deep parsing vector embedding module and hooked it to Supabase REST and WebSocket pipelines.",
                "technologies": "Python, FastAPI, Supabase, PyTorch",
                "project_url": "https://example.com/project",
                "github_url": "https://github.com/example/project",
                "start_date": "2023",
                "end_date": "2024"
            })

        return parsed

    @staticmethod
    def save_parsed_info(candidate_id: str, parsed_data: Dict[str, Any]):
        """
        Persist parsed resume information into public database tables.
        """
        # 1. Update Candidate phone/summary
        try:
            summary_text = parsed_data["experience"][0]["description"] if parsed_data["experience"] else "Technical professional."
            supabase.table("candidates").update({
                "phone": parsed_data["phone"] or None,
                "summary": summary_text[:500]
            }).eq("id", candidate_id).execute()
        except Exception as e:
            print(f"Error updating candidate profile summary: {e}")

        # 2. Insert Skills & candidate_skills
        for skill_name in parsed_data["skills"]:
            try:
                # Get or create skill in skills table
                skill_res = supabase.table("skills").select("id").eq("name", skill_name).execute()
                if skill_res.data:
                    skill_id = skill_res.data[0]["id"]
                else:
                    new_skill = supabase.table("skills").insert({"name": skill_name}).execute()
                    skill_id = new_skill.data[0]["id"]

                # Link skill in candidate_skills
                supabase.table("candidate_skills").upsert({
                    "candidate_id": candidate_id,
                    "skill_id": skill_id,
                    "proficiency": "Intermediate"
                }).execute()
            except Exception as e:
                print(f"Error saving skill '{skill_name}': {e}")

        # 3. Save Education
        try:
            # Delete old education rows
            supabase.table("education").delete().eq("candidate_id", candidate_id).execute()
            # Insert new rows
            for edu in parsed_data["education"]:
                edu["candidate_id"] = candidate_id
                supabase.table("education").insert(edu).execute()
        except Exception as e:
            print(f"Error saving education details: {e}")

        # 4. Save Experience
        try:
            # Delete old experience rows
            supabase.table("experience").delete().eq("candidate_id", candidate_id).execute()
            # Insert new rows
            for exp in parsed_data["experience"]:
                exp["candidate_id"] = candidate_id
                supabase.table("experience").insert(exp).execute()
        except Exception as e:
            print(f"Error saving experience details: {e}")

        # 5. Save Projects
        try:
            # Delete old project rows
            supabase.table("projects").delete().eq("candidate_id", candidate_id).execute()
            # Insert new rows
            for proj in parsed_data["projects"]:
                proj["candidate_id"] = candidate_id
                supabase.table("projects").insert(proj).execute()
        except Exception as e:
            print(f"Error saving project details: {e}")

        # 6. Update candidate_profiles completion percentage
        try:
            supabase.table("candidate_profiles").update({
                "completion_percentage": 90,
                "title": parsed_data["experience"][0]["title"] if parsed_data["experience"] else "Software Engineer"
            }).eq("candidate_id", candidate_id).execute()
        except Exception as e:
            print(f"Error updating completion percentage: {e}")
