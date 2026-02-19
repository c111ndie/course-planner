from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Course Planner API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentProfile(BaseModel):
    program: str
    intake_year: str
    completed_courses: str
    max_credits_per_term: int


class Course(BaseModel):
    code: str


class Term(BaseModel):
    term_name: str
    courses: List[Course]


class StudyPlan(BaseModel):
    terms: List[Term]


@app.get("/")
def read_root():
    return {"message": "Course Planner API"}


@app.post("/plan", response_model=StudyPlan)
def generate_plan(profile: StudentProfile):
    """
    Generate a mocked study plan based on student profile.
    This is a hardcoded response for demonstration purposes.
    """
    # Mock data - hardcoded study plan
    mock_plan = StudyPlan(
        terms=[
            Term(
                term_name="Fall 2024",
                courses=[
                    Course(code="CS101"),
                    Course(code="MATH201"),
                    Course(code="ENG100"),
                ]
            ),
            Term(
                term_name="Winter 2025",
                courses=[
                    Course(code="CS102"),
                    Course(code="MATH202"),
                    Course(code="PHYS101"),
                ]
            ),
            Term(
                term_name="Fall 2025",
                courses=[
                    Course(code="CS201"),
                    Course(code="CS202"),
                    Course(code="STAT200"),
                ]
            ),
            Term(
                term_name="Winter 2026",
                courses=[
                    Course(code="CS301"),
                    Course(code="CS302"),
                ]
            ),
        ]
    )
    
    return mock_plan


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
