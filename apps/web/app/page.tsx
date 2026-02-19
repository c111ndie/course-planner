'use client';

import Image from 'next/image';
import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface WelcomeViewProps {
  program: string;
  intakeYear: string;
  intakeYearOptions: string[];
  currentYearTerm: string;
  quickCompletedCourses: string;
  isDetailedCompletedCourses: boolean;
  completedCoursesByTerm: Record<string, string>;
  maxCredits: number;
  isLoading: boolean;
  error: string | null;
  onProgramChange: (value: string) => void;
  onIntakeYearChange: (value: string) => void;
  onCurrentYearTermChange: (value: string) => void;
  onQuickCompletedCoursesChange: (value: string) => void;
  onDetailedCompletedCoursesToggle: (value: boolean) => void;
  onCompletedCoursesByTermChange: (term: string, value: string) => void;
  onMaxCreditsChange: (value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

interface PlanViewProps {
  studyPlan: StudyPlan;
  maxCredits: number;
  className?: string;
}

interface TermCardProps {
  term: Term;
  maxCredits: number;
}

interface ChatThreadProps {
  messages: ChatMessage[];
  className?: string;
}

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

interface WorkspaceViewProps {
  studyPlan: StudyPlan;
  maxCredits: number;
  error: string | null;
  messages: ChatMessage[];
  draftMessage: string;
  onDraftChange: (value: string) => void;
  onSendMessage: () => void;
  onStartOver: () => void;
}

const labelClass = 'mb-2 block text-sm font-medium text-grape-dusty';
const inputClass =
  'w-full rounded-md border border-lilac-ash bg-white px-3 py-2 text-indigo-space placeholder:text-lilac-ash focus:outline-none focus:ring-2 focus:ring-grape-dusty';
const cardClass = 'rounded-2xl border border-lilac-ash bg-white/95 shadow-[0_10px_30px_rgba(34,34,59,0.08)]';
const primaryButtonClass =
  'rounded-md bg-grape-dusty px-4 py-2 text-seashell transition-colors hover:bg-indigo-space focus:outline-none focus:ring-2 focus:ring-grape-dusty focus:ring-offset-2 focus:ring-offset-seashell disabled:cursor-not-allowed disabled:bg-lilac-ash';
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: '400',
});
const currentYearTermOptions = [
  "Haven't started",
  'Year 1 Fall',
  'Year 1 Spring',
  'Year 2 Fall',
  'Year 2 Spring',
  'Year 3 Fall',
  'Year 3 Spring',
  'Year 4 Fall',
] as const;
const planningTermSequence = [
  'Year 1 Fall',
  'Year 1 Spring',
  'Year 2 Fall',
  'Year 2 Spring',
  'Year 3 Fall',
  'Year 3 Spring',
  'Year 4 Fall',
] as const;

export default function Home() {
  const currentCalendarYear = new Date().getFullYear();
  const intakeYearOptions = Array.from({ length: 6 }, (_, index) => String(currentCalendarYear - 5 + index));
  const [program, setProgram] = useState('Computer Science');
  const [intakeYear, setIntakeYear] = useState('2024');
  const [currentYearTerm, setCurrentYearTerm] = useState("Haven't started");
  const [quickCompletedCourses, setQuickCompletedCourses] = useState('');
  const [isDetailedCompletedCourses, setIsDetailedCompletedCourses] = useState(false);
  const [completedCoursesByTerm, setCompletedCoursesByTerm] = useState<Record<string, string>>({});
  const [maxCredits, setMaxCredits] = useState(15);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draftMessage, setDraftMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAssistantPlanSummary = (plan: StudyPlan): string => {
    const firstTerm = plan.terms[0];
    if (!firstTerm) {
      return 'Your plan is ready. Ask me to summarize term-by-term recommendations.';
    }
    return `Your plan starts with ${firstTerm.term_name}, which includes ${firstTerm.courses.length} courses.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const completedCourses = isDetailedCompletedCourses
        ? planningTermSequence
            .flatMap((term) =>
              (completedCoursesByTerm[term] ?? '')
                .split(',')
                .map((course) => course.trim())
                .filter(Boolean),
            )
            .join(', ')
        : quickCompletedCourses;

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

      const data: StudyPlan = await response.json();
      setStudyPlan(data);
      setMessages([
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: createAssistantPlanSummary(data),
        },
      ]);
      setDraftMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAssistantReply = (message: string): string => {
    if (!studyPlan || studyPlan.terms.length === 0) {
      return 'I can help once a plan is available.';
    }

    const normalized = message.toLowerCase();
    const firstTerm = studyPlan.terms[0];

    if (normalized.includes('first') || normalized.includes('start')) {
      return `${firstTerm.term_name} has ${firstTerm.courses.length} courses: ${firstTerm.courses.map((course) => course.code).join(', ')}.`;
    }

    if (normalized.includes('credits')) {
      return `Your current target is ${maxCredits} credits per term. I can suggest lighter or heavier pacing if you want.`;
    }

    return `You have ${studyPlan.terms.length} planned terms. Ask about a specific term and I will summarize it.`;
  };

  const handleSendMessage = () => {
    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}-reply`,
      role: 'assistant',
      content: generateAssistantReply(trimmed),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setDraftMessage('');
  };

  const handleStartOver = () => {
    setStudyPlan(null);
    setMessages([]);
    setDraftMessage('');
    setError(null);
  };

  const handleCompletedCoursesByTermChange = (term: string, value: string) => {
    setCompletedCoursesByTerm((prev) => ({
      ...prev,
      [term]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-seashell text-indigo-space">
      {!studyPlan && <BrandBadge />}
      {studyPlan ? (
        <WorkspaceView
          studyPlan={studyPlan}
          maxCredits={maxCredits}
          error={error}
          messages={messages}
          draftMessage={draftMessage}
          onDraftChange={setDraftMessage}
          onSendMessage={handleSendMessage}
          onStartOver={handleStartOver}
        />
      ) : (
        <WelcomeView
          program={program}
          intakeYear={intakeYear}
          intakeYearOptions={intakeYearOptions}
          currentYearTerm={currentYearTerm}
          quickCompletedCourses={quickCompletedCourses}
          isDetailedCompletedCourses={isDetailedCompletedCourses}
          completedCoursesByTerm={completedCoursesByTerm}
          maxCredits={maxCredits}
          isLoading={isLoading}
          error={error}
          onProgramChange={setProgram}
          onIntakeYearChange={setIntakeYear}
          onCurrentYearTermChange={setCurrentYearTerm}
          onQuickCompletedCoursesChange={setQuickCompletedCourses}
          onDetailedCompletedCoursesToggle={setIsDetailedCompletedCourses}
          onCompletedCoursesByTermChange={handleCompletedCoursesByTermChange}
          onMaxCreditsChange={setMaxCredits}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function BrandBadge() {
  return (
    <div className="fixed left-4 top-4 z-30">
      <Image
        src="/planly-logo-v2.png"
        alt="Planly logo"
        width={170}
        height={43}
        priority
        className="mix-blend-multiply"
      />
    </div>
  );
}

function WelcomeView({
  program,
  intakeYear,
  intakeYearOptions,
  currentYearTerm,
  quickCompletedCourses,
  isDetailedCompletedCourses,
  completedCoursesByTerm,
  maxCredits,
  isLoading,
  error,
  onProgramChange,
  onIntakeYearChange,
  onCurrentYearTermChange,
  onQuickCompletedCoursesChange,
  onDetailedCompletedCoursesToggle,
  onCompletedCoursesByTermChange,
  onMaxCreditsChange,
  onSubmit,
}: WelcomeViewProps) {
  const selectedTermIndex = planningTermSequence.indexOf(currentYearTerm as (typeof planningTermSequence)[number]);
  const visibleTerms = selectedTermIndex >= 0 ? planningTermSequence.slice(0, selectedTermIndex + 1) : [];

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(201,173,167,0.24),transparent_52%)]"></div>
      <section className="w-full rounded-3xl border border-lilac-ash/40 bg-white/40 px-4 py-10 text-center backdrop-blur-[1px] sm:px-8">
        <h1 className={`${cormorantGaramond.className} text-balance text-4xl font-normal text-indigo-space sm:text-5xl`}>
          Plan your degree roadmap.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-grape-dusty sm:text-base">
          Build a term-by-term plan, then explore it in your workspace with planner and chat.
        </p>

        <div className={`${cardClass} mx-auto mt-10 w-full max-w-2xl p-6 text-left sm:p-8`}>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="program" className={labelClass}>
                Program
              </label>
              <select
                id="program"
                value={program}
                onChange={(e) => onProgramChange(e.target.value)}
                className={inputClass}
              >
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div>
              <label htmlFor="intake-year" className={labelClass}>
                Intake Year
              </label>
              <select
                id="intake-year"
                value={intakeYear}
                onChange={(e) => onIntakeYearChange(e.target.value)}
                className={inputClass}
              >
                {intakeYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="current-year-term" className={labelClass}>
                Current Year / Term
              </label>
              <select
                id="current-year-term"
                value={currentYearTerm}
                onChange={(e) => onCurrentYearTermChange(e.target.value)}
                className={inputClass}
              >
                {currentYearTermOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-grape-dusty">
                We will generate your plan starting from the term after this selection.
              </p>
            </div>

            <div className="rounded-xl border border-lilac-ash/60 bg-seashell/50 p-4">
              <h3 className="text-base font-semibold text-indigo-space">Completed Courses</h3>
              <p className="mt-1 text-sm text-grape-dusty">
                Add what you&apos;ve already taken. You can paste a list, or add by term.
              </p>

              <div className="mt-4">
                <label htmlFor="completed-courses" className={labelClass}>
                  Completed Courses (comma-separated)
                </label>
                <input
                  id="completed-courses"
                  type="text"
                  value={quickCompletedCourses}
                  onChange={(e) => onQuickCompletedCoursesChange(e.target.value)}
                  placeholder="e.g., COMP2011, MATH1012, LANG1002"
                  className={inputClass}
                />
              </div>

              <label className="mt-4 inline-flex items-center gap-2 text-sm text-grape-dusty">
                <input
                  type="checkbox"
                  checked={isDetailedCompletedCourses}
                  onChange={(e) => onDetailedCompletedCoursesToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-lilac-ash text-grape-dusty focus:ring-grape-dusty"
                />
                Add courses by term (recommended)
              </label>

              {isDetailedCompletedCourses && (
                <div className="mt-4 space-y-3">
                  {visibleTerms.length === 0 ? (
                    <p className="rounded-md border border-lilac-ash bg-white px-3 py-2 text-sm text-grape-dusty">
                      No prior terms to add yet. Select a current term to unlock term-by-term entry.
                    </p>
                  ) : (
                    visibleTerms.map((term) => (
                      <div key={term} className="rounded-lg border border-lilac-ash bg-white p-3">
                        <p className="mb-2 text-sm font-semibold text-indigo-space">{term}</p>
                        <input
                          type="text"
                          value={completedCoursesByTerm[term] ?? ''}
                          onChange={(e) => onCompletedCoursesByTermChange(term, e.target.value)}
                          placeholder="e.g., COMP2011, MATH1012"
                          className={inputClass}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="max-credits" className={labelClass}>
                Max Credits Per Term
              </label>
              <input
                id="max-credits"
                type="number"
                value={maxCredits}
                onChange={(e) => onMaxCreditsChange(parseInt(e.target.value))}
                min="1"
                max="30"
                className={inputClass}
              />
            </div>

            <button type="submit" disabled={isLoading} className={`w-full ${primaryButtonClass}`}>
              {isLoading ? 'Generating...' : 'Generate Plan'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-md border border-lilac-ash bg-almond-silk p-4 text-indigo-space">
              {error}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function WorkspaceView({
  studyPlan,
  maxCredits,
  error,
  messages,
  draftMessage,
  onDraftChange,
  onSendMessage,
  onStartOver,
}: WorkspaceViewProps) {
  const [plannerWidth, setPlannerWidth] = useState(62);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(75, Math.max(40, raw));
      setPlannerWidth(clamped);
    };

    const onMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      <main className="relative mx-auto w-full max-w-7xl px-4 pb-44 pt-10 sm:px-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(154,140,152,0.20),transparent_70%)]"></div>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-grape-dusty">Course Planner Workspace</p>
            <h1 className={`${cormorantGaramond.className} mt-1 text-4xl font-normal text-indigo-space`}>
              Your generated roadmap
            </h1>
          </div>
          <button
            type="button"
            onClick={onStartOver}
            className="rounded-md border border-lilac-ash bg-white px-4 py-2 text-sm font-medium text-grape-dusty transition-colors hover:text-indigo-space focus:outline-none focus:ring-2 focus:ring-grape-dusty focus:ring-offset-2 focus:ring-offset-seashell"
          >
            Start over
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-lilac-ash bg-almond-silk p-4 text-indigo-space">
            {error}
          </div>
        )}

        <section className="space-y-6">
          <div className="grid gap-6 lg:hidden">
            <PlanView studyPlan={studyPlan} maxCredits={maxCredits} className="min-h-[32rem]" />
            <ChatThread messages={messages} className="min-h-[32rem]" />
          </div>

          <div ref={containerRef} className="hidden items-stretch gap-3 lg:flex">
            <div style={{ width: `${plannerWidth}%` }}>
              <PlanView studyPlan={studyPlan} maxCredits={maxCredits} className="min-h-[38rem] h-full" />
            </div>

            <button
              type="button"
              onMouseDown={() => setIsResizing(true)}
              aria-label="Resize planner and chat panels"
              className="group flex w-2 cursor-col-resize items-center justify-center rounded-full bg-lilac-ash/40 hover:bg-lilac-ash/60 focus:outline-none focus:ring-2 focus:ring-grape-dusty"
            >
              <span className="h-16 w-px rounded-full bg-grape-dusty/80 group-hover:bg-indigo-space"></span>
            </button>

            <div style={{ width: `${100 - plannerWidth}%` }}>
              <ChatThread messages={messages} className="min-h-[38rem] h-full" />
            </div>
          </div>
        </section>
      </main>

      <ChatComposer value={draftMessage} onChange={onDraftChange} onSend={onSendMessage} />
    </>
  );
}

function PlanView({ studyPlan, maxCredits, className }: PlanViewProps) {
  return (
    <section className={`${cardClass} p-6 sm:p-8 ${className ?? ''}`}>
      <div className="mb-6 border-b border-lilac-ash pb-4">
        <h2 className="text-2xl font-semibold text-indigo-space">Planner</h2>
        <p className="mt-1 text-sm text-grape-dusty">Term cards and course lists generated from your profile.</p>
      </div>

      <div className="space-y-4">
        {studyPlan.terms.map((term, index) => (
          <TermCard key={`${term.term_name}-${index}`} term={term} maxCredits={maxCredits} />
        ))}
      </div>
    </section>
  );
}

function TermCard({ term, maxCredits }: TermCardProps) {
  return (
    <article className="rounded-xl border border-lilac-ash bg-white p-4">
      <h3 className="text-lg font-semibold text-indigo-space">{term.term_name}</h3>
      <p className="mt-1 text-sm text-grape-dusty">
        {term.courses.length} courses • Max credits target: {maxCredits}
      </p>
      <ul className="mt-3 space-y-2">
        {term.courses.map((course, courseIndex) => (
          <li key={`${course.code}-${courseIndex}`} className="flex items-center text-indigo-space">
            <span className="mr-3 h-2 w-2 rounded-full bg-grape-dusty"></span>
            {course.code}
          </li>
        ))}
      </ul>
    </article>
  );
}

function ChatThread({ messages, className }: ChatThreadProps) {
  return (
    <section className={`${cardClass} p-6 sm:p-8 ${className ?? ''}`}>
      <div className="mb-6 border-b border-lilac-ash pb-4">
        <h2 className="text-2xl font-semibold text-indigo-space">Chat</h2>
        <p className="mt-1 text-sm text-grape-dusty">Ask about pacing, term load, or course sequencing.</p>
      </div>

      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
              message.role === 'user'
                ? 'ml-auto bg-grape-dusty text-seashell'
                : 'bg-almond-silk text-indigo-space'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
    </section>
  );
}

function ChatComposer({ value, onChange, onSend }: ChatComposerProps) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-20 px-4">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-lilac-ash bg-white p-3 shadow-[0_10px_30px_rgba(34,34,59,0.12)]">
        <input
          type="text"
          placeholder="Message planner assistant..."
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button type="button" onClick={onSend} className={primaryButtonClass}>
          Send
        </button>
      </div>
    </div>
  );
}
