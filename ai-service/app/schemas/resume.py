from typing import Literal
from pydantic import BaseModel, Field


class Personal(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""


class Education(BaseModel):
    degree: str = ""
    institution: str = ""
    period: str = ""


class Experience(BaseModel):
    title: str = ""
    company: str = ""
    period: str = ""
    summary: str = ""


class Project(BaseModel):
    name: str = ""
    summary: str = ""
    tech: list[str] = Field(default_factory=list)


class ResumeAnalysis(BaseModel):
    personal: Personal = Field(default_factory=Personal)
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    engine: Literal["llm", "heuristic"] = "heuristic"
    warnings: list[str] = Field(default_factory=list)
