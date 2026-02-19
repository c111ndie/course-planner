# Course Planner API

FastAPI backend for the Course Planner application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the API

```bash
python main.py
```

The API will be available at `http://localhost:8000`

API documentation (Swagger UI) available at `http://localhost:8000/docs`

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
