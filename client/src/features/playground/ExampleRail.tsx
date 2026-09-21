import { useState } from 'react';
import { X } from 'lucide-react';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import type { Question } from '../../types';
import './rail.css';

const LESSONS: {
  badge: 'Noul' | 'Choice' | 'Score';
  title: string;
  subtitle: string;
  emoji: string;
  state: unknown;
  questions: Record<string, Question>;
}[] = [
  {
    badge: 'Noul',
    title: 'Is hotdog a sandwich?',
    subtitle: 'Settle the everlasting debate',
    emoji: '🌭',
    state: { subject: 'A hotdog placed between two slices of bread' },
    questions: {
      sandwich: { type: 'noul', instructions: 'Is the subject a sandwich?', criteria: { true: 'Meets sandwich criteria', false: 'Does not meet sandwich criteria' } },
    },
  },
  {
    badge: 'Choice',
    title: 'What color is the sky?',
    subtitle: 'Go beyond blue',
    emoji: '☀️',
    state: { object: 'The sky on a clear day' },
    questions: {
      sky_color: {
        type: 'choice',
        instructions: "What color is the object's sky?",
        criteria: { blue: 'A clear blue', gray: 'Overcast', orange: 'Sunset' },
      },
    },
  },
  {
    badge: 'Score',
    title: 'Can monkeys create art?',
    subtitle: 'A real-life court case',
    emoji: '📷',
    state: { subject: 'A photograph taken by a monkey' },
    questions: {
      artistic: {
        type: 'score',
        instructions: 'How much artistic merit does the subject have?',
        criteria: ['None', 'Some', 'A lot'],
      },
    },
  },
];

const USE_CASES: { title: string; subtitle: string; state: unknown; questions: Record<string, Question> }[] = [
  {
    title: 'Resumé screening',
    subtitle: "Assess an engineering candidate's fit",
    state: { resume: 'Has tech profile' },
    questions: { fit: { type: 'noul', instructions: 'Are they a good fit?', criteria: { true: 'Yes', false: 'No' } } },
  },
  {
    title: 'Support agent audit',
    subtitle: "Audit a customer support agent's chat session",
    state: { chat: 'Chat transcript' },
    questions: { helpful: { type: 'choice', instructions: 'How helpful was the agent?', criteria: { excellent: '', good: '', poor: '' } } },
  },
  {
    title: 'Helpdesk ticket triage',
    subtitle: 'Route a ticket to the right team',
    state: { ticket: 'Ticket text' },
    questions: { team: { type: 'score', instructions: 'Which team?', criteria: ['Billing', 'Tech', 'Sales'] } },
  },
];

export function ExampleRail() {
  const setExamplesOpen = usePlaygroundStore((s) => s.setExamplesOpen);
  const loadPreset = usePlaygroundStore((s) => s.loadPreset);
  const [selectedReal, setSelectedReal] = useState(0);

  return (
    <div className="rail">
      <div className="rail-hero">
        <div className="rail-hero-label">EXAMPLE REQUESTS</div>
        <button className="rail-hero-close" onClick={() => setExamplesOpen(false)} aria-label="Close examples">
          <X size={20} strokeWidth={1.7} />
        </button>
        <h1 className="rail-hero-title">Ask Aida</h1>
      </div>

      <div className="rail-section-label">WALKTHROUGH LESSONS</div>
      <div className="lesson-cards">
        {LESSONS.map((l) => (
          <button
            key={l.badge}
            className="lesson-card"
            onClick={() => loadPreset(l.state, l.questions)}
            aria-label={`Load ${l.badge} lesson`}
          >
            <span className="lesson-badge">{l.badge}</span>
            <span className="lesson-emoji" aria-hidden>
              {l.emoji}
            </span>
            <span className="lesson-title">{l.title}</span>
            <span className="lesson-subtitle">{l.subtitle}</span>
          </button>
        ))}
      </div>

      <div className="rail-section-label">REAL-LIFE USE CASES</div>
      <div className="real-cases">
        {USE_CASES.map((c, idx) => (
          <button
            key={c.title}
            className={`real-case${selectedReal === idx ? ' selected' : ''}`}
            onClick={() => {
              setSelectedReal(idx);
              loadPreset(c.state, c.questions);
            }}
          >
            <span className="real-case-title">{c.title}</span>
            <span className="real-case-subtitle">{c.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

