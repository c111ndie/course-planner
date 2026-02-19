# Course Planner

A minimal full-stack web application for course planning.

## Tech Stack

- **Frontend**: Next.js (App Router) with TypeScript
- **Backend**: FastAPI (Python)

## Repository Structure

```
/apps/web → Next.js frontend application
/apps/api → FastAPI backend application
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.8 or later)
- npm or yarn

### Running the Backend (FastAPI)

1. Navigate to the API directory:
```bash
cd apps/api
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`  
API documentation (Swagger UI) at `http://localhost:8000/docs`

### Running the Frontend (Next.js)

1. Open a new terminal and navigate to the web directory:
```bash
cd apps/web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Using the Application

1. Make sure both the backend and frontend are running
2. Open `http://localhost:3000` in your browser
3. Fill in the form:
   - Select a program (currently only "Computer Science" available)
   - Select an intake year (currently only "2024" available)
   - Enter completed courses (comma-separated, e.g., "CS100, MATH100")
   - Enter max credits per term (e.g., 15)
4. Click "Generate Plan"
5. View your study plan with courses organized by term

## Features

- Simple form interface for student profile input
- API integration between frontend and backend
- Mock study plan generation (hardcoded data)
- Responsive UI design with Tailwind CSS

## API Endpoints

### POST /plan

Generate a study plan based on student profile.

**Request:**
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
        {"code": "MATH201"}
      ]
    }
  ]
}
```

## Notes

- This is a minimal skeleton with mock data only
- No authentication or database implementation
- Study plan is hardcoded and does not use input parameters yet
