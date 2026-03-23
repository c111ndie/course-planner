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

If `npm` is not found, install Node.js once (npm is bundled with Node):

```bash
brew install node
```

## One-Time Setup

Run once after cloning (or when dependencies change):

```bash
cd /Users/cindie06/Desktop/course-planner
python3 -m venv .venv
source .venv/bin/activate
pip install -r apps/api/requirements.txt
cd apps/web
npm install
```

## Daily Start

Run these each time you want to start the app:

1. Start backend:
```bash
cd /Users/cindie06/Desktop/course-planner
source .venv/bin/activate
python apps/api/main.py
```

2. Start frontend (new terminal):
```bash
cd /Users/cindie06/Desktop/course-planner/apps/web
npm run dev
```

### Running the Backend (FastAPI)

1. Navigate to the API directory from anywhere:
```bash
cd "$(git rev-parse --show-toplevel)/apps/api"
```

2. Activate the existing root virtual environment:
```bash
source ../../.venv/bin/activate  # On Windows (PowerShell): ..\..\.venv\Scripts\Activate.ps1
```

3. Install dependencies (only needed after changes):
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

1. Open a new terminal and navigate to the web directory from anywhere:
```bash
cd "$(git rev-parse --show-toplevel)/apps/web"
```

2. Install dependencies (first time only):
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
