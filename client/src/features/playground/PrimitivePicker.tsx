import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import type { Question } from '../../types';

interface PrimitivePickerProps {
  onSelect: (key: string, q: Question) => void;
  existingKeys: string[];
}

function makeId(existingKeys: string[]): string {
  let n = existingKeys.length + 1;
  let id = `question_${n}`;
  while (existingKeys.includes(id)) {
    n += 1;
    id = `question_${n}`;
  }
  return id;
}

const PRIMITIVES: {
  type: Question['type'];
  title: string;
  desc: string;
  example: string;
  docsUrl: string;
}[] = [
  {
    type: 'noul',
    title: 'Noul',
    desc: 'Evaluate how true something is',
    example: 'Example: "Is `food` a sandwich?"',
    docsUrl: 'https://docs.gotraxx.ai/primitives/noul',
  },
  {
    type: 'score',
    title: 'Score',
    desc: 'Set up a rubric to grade with',
    example: 'Example: "How much did `subject` contribute?"',
    docsUrl: 'https://docs.gotraxx.ai/primitives/score',
  },
  {
    type: 'choice',
    title: 'Choice',
    desc: 'Ask a multiple choice question',
    example: 'Example: "What color is `object`?"',
    docsUrl: 'https://docs.gotraxx.ai/primitives/choice',
  },
];

function skeleton(type: Question['type']): Question {
  if (type === 'noul') {
    return { type: 'noul', instructions: '', criteria: { true: '', false: '' } };
  }
  if (type === 'choice') {
    return { type: 'choice', instructions: '', criteria: { option_a: '', option_b: '' } };
  }
  return { type: 'score', instructions: '', criteria: ['Low', 'Medium', 'High'] };
}

export function PrimitivePicker({ onSelect, existingKeys }: PrimitivePickerProps) {
  const handleSelect = (type: Question['type']) => {
    onSelect(makeId(existingKeys), skeleton(type));
  };

  return (
    <div className="primitive-picker">
      <div className="picker-hint">Select primitive type to add a question</div>
      {PRIMITIVES.map((p) => (
        <div className="primitive-row" key={p.type}>
          <button className="primitive-main" onClick={() => handleSelect(p.type)}>
            <span className="primitive-title">{p.title}</span>
            <span className="primitive-desc">{p.desc}</span>
            <span className="primitive-example">{p.example}</span>
          </button>
          <a className="primitive-docs" href={p.docsUrl} target="_blank" rel="noreferrer" aria-label={`${p.title} docs`}>
            <span>Docs</span>
            <ExternalLink size={14} strokeWidth={1.7} />
          </a>
        </div>
      ))}
    </div>
  );
}

export function AddQuestionButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="add-question-btn" onClick={onOpen} aria-haspopup="menu">
      <Plus size={16} strokeWidth={2} />
      Add Question
    </button>
  );
}

export function QuestionRowDelete({ onDelete, label }: { onDelete: () => void; label: string }) {
  return (
    <button className="question-delete" onClick={onDelete} aria-label={`Delete ${label}`}>
      <Trash2 size={16} strokeWidth={1.7} />
    </button>
  );
}