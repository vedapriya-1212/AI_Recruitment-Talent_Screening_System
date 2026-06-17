from database import supabase

class RankingService:
    @staticmethod
    def recalculate_ranks(job_id: str) -> None:
        """
        Fetch all candidate rankings for a specific job, sort by score descending,
        and update the rank sequentially in the database.
        """
        try:
            res = (
                supabase.table("candidate_rankings")
                .select("*")
                .eq("job_id", job_id)
                .order("score", desc=True)
                .execute()
            )
            
            if not res.data:
                return
                
            for index, row in enumerate(res.data):
                rank = index + 1
                supabase.table("candidate_rankings").update({
                    "rank": rank
                }).eq("candidate_id", row["candidate_id"]).eq("job_id", job_id).execute()
        except Exception as e:
            print(f"Error recalculating ranks for job {job_id}: {e}")

    @staticmethod
    def get_candidate_rank(candidate_id: str, job_id: str) -> dict:
        """
        Triggers rank recalculation and fetches the rank, total applicants,
        and percentile for a specific candidate.
        """
        # Recalculate ranks first to ensure data freshness
        RankingService.recalculate_ranks(job_id)
        
        try:
            res = (
                supabase.table("candidate_rankings")
                .select("*")
                .eq("job_id", job_id)
                .order("score", desc=True)
                .execute()
            )
            
            total_candidates = len(res.data)
            candidate_row = next((r for r in res.data if r["candidate_id"] == candidate_id), None)
            
            if not candidate_row:
                # Fallback if matching record is not generated yet
                return {
                    "rank": total_candidates + 1,
                    "total_candidates": total_candidates + 1,
                    "percentile": 50.0
                }
                
            rank = candidate_row.get("rank") or (total_candidates)
            
            # Percentile formula: (total - rank + 1) / total * 100
            if total_candidates > 0:
                percentile = round(((total_candidates - rank + 1) / total_candidates) * 100, 1)
            else:
                percentile = 100.0
                
            return {
                "rank": rank,
                "total_candidates": total_candidates,
                "percentile": percentile
            }
        except Exception as e:
            print(f"Error fetching rank for candidate {candidate_id} on job {job_id}: {e}")
            return {
                "rank": 1,
                "total_candidates": 1,
                "percentile": 100.0
            }
