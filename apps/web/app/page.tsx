'use client';

import { useState } from 'react';

interface Course {
  code: string;
}

interface Term {
  term_name: string;
  courses: Course[];
}

interface StudyPlan {
  terms: Term[];
}

export default function Home() {
  const [program, setProgram] = useState('Computer Science');
  const [intakeYear, setIntakeYear] = useState('2024');
  const [completedCourses, setCompletedCourses] = useState('');
  const [maxCredits, setMaxCredits] = useState(15);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program,
          intake_year: intakeYear,
          completed_courses: completedCourses,
          max_credits_per_term: maxCredits,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      setStudyPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Course Planner
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                Program
              </label>
              <select
                id="program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div>
              <label htmlFor="intake-year" className="block text-sm font-medium text-gray-700 mb-2">
                Intake Year
              </label>
              <select
                id="intake-year"
                value={intakeYear}
                onChange={(e) => setIntakeYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024">2024</option>
              </select>
            </div>

            <div>
              <label htmlFor="completed-courses" className="block text-sm font-medium text-gray-700 mb-2">
                Completed Courses (comma-separated)
              </label>
              <input
                id="completed-courses"
                type="text"
                value={completedCourses}
                onChange={(e) => setCompletedCourses(e.target.value)}
                placeholder="e.g., CS100, MATH100, ENG100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="max-credits" className="block text-sm font-medium text-gray-700 mb-2">
                Max Credits Per Term
              </label>
              <input
                id="max-credits"
                type="number"
                value={maxCredits}
                onChange={(e) => setMaxCredits(parseInt(e.target.value))}
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Plan'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>

        {studyPlan && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Study Plan</h2>
            <div className="space-y-6">
              {studyPlan.terms.map((term, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {term.term_name}
                  </h3>
                  <ul className="space-y-2">
                    {term.courses.map((course, courseIndex) => (
                      <li
                        key={courseIndex}
                        className="flex items-center text-gray-700"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {course.code}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
