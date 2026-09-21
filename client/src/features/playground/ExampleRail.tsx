import { useState } from 'react';
import { X } from 'lucide-react';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import type { Question } from '../../types';
import examples from './examples.json';
import './rail.css';

type Lesson = (typeof examples.lessons)[number];
type UseCase = (typeof examples.useCases)[number];

const LESSONS: Lesson[] = examples.lessons;
const USE_CASES: UseCase[] = examples.useCases;

function loadQuestions(questions: Record<string, unknown>): Record<string, Question> {
  return questions as Record<string, Question>;
}

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
            onClick={() => loadPreset(l.state, loadQuestions(l.questions))}
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
              loadPreset(c.state, loadQuestions(c.questions));
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

