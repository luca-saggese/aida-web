import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Question } from '../../types';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import { PrimitivePicker, AddQuestionButton } from './PrimitivePicker';

function QuestionEditor({ id, q }: { id: string; q: Question }) {
  const removeQuestion = usePlaygroundStore((s) => s.removeQuestion);
  const renameQuestion = usePlaygroundStore((s) => s.renameQuestion);

  const update = (patch: Partial<Question> & { criteria?: unknown }) => {
    const next = { ...q, ...patch } as Question;
    usePlaygroundStore.getState().addQuestion(id, next);
  };

  const key = q.type;

  return (
    <div className="q-card" data-type={key}>
      <div className="q-card-head">
        <input
          className="q-name-input"
          value={id}
          onChange={(e) => renameQuestion(id, e.target.value)}
          aria-label="Question name"
          title="Click to rename"
        />
        <span className="q-badge">{key}</span>
        <button className="q-delete" onClick={() => removeQuestion(id)} aria-label="Delete question">
          <Trash2 size={16} strokeWidth={1.7} />
        </button>
      </div>

      <div className="q-field">
        <label>Instructions</label>
        <input
          className="q-text-input"
          value={typeof q.instructions === 'string' ? (q.instructions as string) : ''}
          onChange={(e) => update({ instructions: e.target.value })}
          placeholder="Instructions"
        />
      </div>

      {key === 'noul' && <NoulEditor q={q as Extract<Question, { type: 'noul' }>} onChange={(c) => update({ criteria: c })} />}
      {key === 'choice' && <ChoiceEditor q={q as Extract<Question, { type: 'choice' }>} onChange={(c) => update({ criteria: c })} />}
      {key === 'score' && <ScoreEditor q={q as Extract<Question, { type: 'score' }>} onChange={(c) => update({ criteria: c })} />}
    </div>
  );
}

function NoulEditor({
  q,
  onChange,
}: {
  q: Extract<Question, { type: 'noul' }>;
  onChange: (criteria: { true?: unknown; false?: unknown }) => void;
}) {
  const criteria = q.criteria ?? { true: '', false: '' };
  return (
    <div className="q-criteria">
      <div className="q-field">
        <label>Criteria true</label>
        <input
          className="q-text-input"
          value={typeof criteria.true === 'string' ? criteria.true : ''}
          onChange={(e) => onChange({ ...criteria, true: e.target.value })}
          placeholder="True description (optional)"
        />
      </div>
      <div className="q-field">
        <label>Criteria false</label>
        <input
          className="q-text-input"
          value={typeof criteria.false === 'string' ? criteria.false : ''}
          onChange={(e) => onChange({ ...criteria, false: e.target.value })}
          placeholder="False description (optional)"
        />
      </div>
    </div>
  );
}

function ChoiceEditor({
  q,
  onChange,
}: {
  q: Extract<Question, { type: 'choice' }>;
  onChange: (criteria: Record<string, unknown>) => void;
}) {
  const options = Object.keys(q.criteria);
  const updateKey = (oldKey: string, newKey: string) => {
    const cleared: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(q.criteria)) {
      cleared[k === oldKey ? newKey : k] = v;
    }
    onChange(cleared);
  };
  const updateValue = (key: string, value: string) => onChange({ ...q.criteria, [key]: value });
  const addOption = () => onChange({ ...q.criteria, [`option_${options.length + 1}`]: '' });
  const removeOption = (key: string) => {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(q.criteria)) if (k !== key) next[k] = v;
    onChange(next);
  };

  return (
    <div className="q-criteria">
      <div className="q-options-head">
        <label>Options</label>
        <button className="q-add-option" onClick={addOption}>
          <Plus size={14} strokeWidth={2} /> Add
        </button>
      </div>
      {options.map((key, idx) => (
        <div className="q-option-row" key={idx}>
          <input
            className="q-key-input"
            value={key}
            onChange={(e) => updateKey(key, e.target.value)}
            aria-label="Option key"
          />
          <input
            className="q-text-input"
            value={typeof q.criteria[key] === 'string' ? (q.criteria[key] as string) : ''}
            onChange={(e) => updateValue(key, e.target.value)}
            placeholder="Description (optional)"
          />
          <button className="q-option-remove" onClick={() => removeOption(key)} aria-label="Remove option">
            <Trash2 size={14} strokeWidth={1.7} />
          </button>
        </div>
      ))}
      {options.length === 0 && <div className="q-empty-hint">Add at least one option.</div>}
    </div>
  );
}

function ScoreEditor({
  q,
  onChange,
}: {
  q: Extract<Question, { type: 'score' }>;
  onChange: (criteria: unknown[]) => void;
}) {
  const levels = q.criteria;
  const updateLevel = (idx: number, value: string) => onChange(levels.map((l, i) => (i === idx ? value : l)));
  const addLevel = () => {
    if (levels.length >= 10) return;
    onChange([...levels, `Level ${levels.length + 1}`]);
  };
  const removeLevel = (idx: number) => {
    if (levels.length <= 2) return;
    onChange(levels.filter((_, i) => i !== idx));
  };

  return (
    <div className="q-criteria">
      <div className="q-options-head">
        <label>Rubric levels (ordered lowest → highest)</label>
        <button className="q-add-option" onClick={addLevel} disabled={levels.length >= 10}>
          <Plus size={14} strokeWidth={2} /> Add
        </button>
      </div>
      {levels.map((level, idx) => (
        <div className="q-option-row" key={idx}>
          <span className="q-level-index">{idx}</span>
          <input
            className="q-text-input"
            value={typeof level === 'string' ? level : ''}
            onChange={(e) => updateLevel(idx, e.target.value)}
            placeholder={`Level ${idx}`}
          />
          <button
            className="q-option-remove"
            onClick={() => removeLevel(idx)}
            disabled={levels.length <= 2}
            aria-label="Remove level"
          >
            <Trash2 size={14} strokeWidth={1.7} />
          </button>
        </div>
      ))}
      <div className="q-hint">{levels.length}/10 levels</div>
    </div>
  );
}

export function QuestionsStructured() {
  const questions = usePlaygroundStore((s) => s.questionsValue);
  const addQuestion = usePlaygroundStore((s) => s.addQuestion);
  const [pickerOpen, setPickerOpen] = useState(false);

  const keys = Object.keys(questions);

  const handleSelect = (key: string, q: Question) => {
    addQuestion(key, q);
    setPickerOpen(false);
  };

  return (
    <div className="questions-structured">
      {keys.length === 0 && !pickerOpen ? (
        <PrimitivePicker onSelect={handleSelect} existingKeys={keys} />
      ) : (
        <>
          {keys.map((id) => (
            <QuestionEditor key={id} id={id} q={questions[id]} />
          ))}
          <div className="add-question-area">
            {pickerOpen ? (
              <div className="inline-picker">
                <button className="inline-picker-close" onClick={() => setPickerOpen(false)}>
                  Cancel
                </button>
                <PrimitivePicker onSelect={handleSelect} existingKeys={keys} />
              </div>
            ) : (
              <AddQuestionButton onOpen={() => setPickerOpen(true)} />
            )}
          </div>
        </>
      )}
    </div>
  );
}