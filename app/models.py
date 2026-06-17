from sqlalchemy import Column,Integer,String,Text
from .database import Base

class Job(Base):

    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True,index=True)
    title = Column(String)
    description = Column(Text)
    skills = Column(Text)


class Candidate(Base):

    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True,index=True)
    name = Column(String)
    email = Column(String)
    resume_path = Column(String)


class Result(Base):

    __tablename__ = "results"

    id = Column(Integer, primary_key=True,index=True)
    candidate_name = Column(String)
    score = Column(Integer)
    status = Column(String)