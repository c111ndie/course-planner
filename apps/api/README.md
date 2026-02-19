# Course Planner API

FastAPI backend for the Course Planner application.

## Setup

Run these commands from the repository root (`course-planner`):

1. Create/activate the project virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r apps/api/requirements.txt
```

## Running the API

```bash
python apps/api/main.py
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI) available at `http://localhost:8000/docs`

## VS Code / Pylance fix

If imports show as unresolved in VS Code, select the interpreter:
- `.venv/bin/python` (macOS/Linux)
- `.venv\Scripts\python.exe` (Windows)

## API Endpoints

### POST /plan

Generate a study plan based on student profile.

**Request Body:**
```json
{
  "program": "Computer Science",
  "intake_year": "2024",
  "completed_courses": "CS100,MATH100",
  "max_credits_per_term": 15
}
```

**Response:**
```json
{
  "terms": [
    {
      "term_name": "Fall 2024",
      "courses": [
        {"code": "CS101"},
        {"code": "MATH201"},
        {"code": "ENG100"}
      ]
    }
  ]
}
```
