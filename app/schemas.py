from pydantic import BaseModel

class JobCreate(BaseModel):
    title:str
    description:str
    skills:str


class JobResponse(JobCreate):
    id:int

    class Config:
        from_attributes=True


class ResultResponse(BaseModel):
    candidate_name:str
    score:int
    status:str

    class Config:
        from_attributes=True