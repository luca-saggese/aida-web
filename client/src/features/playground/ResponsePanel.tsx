import { useState, type ReactNode } from 'react';
import { List, Code2, PanelRightOpen, ChevronDown, ChevronRight, CircleHelp, Copy, Check } from 'lucide-react';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import type { Answer, NoulAnswer, ChoiceAnswer, ScoreAnswer } from '../../types';
import './response.css';

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatRun(meta: { roundTripMs: number; providerMs?: number; overheadMs: number }): string {
  const parts = [`${formatMs(meta.roundTripMs)} total`];
  if (typeof meta.providerMs === 'number') parts.push(`${formatMs(meta.providerMs)} provider`);
  if (typeof meta.overheadMs === 'number') parts.push(`${formatMs(meta.overheadMs)} overhead`);
  return parts.join(' · ');
}

export function ResponsePanel() {
  const response = usePlaygroundStore((s) => s.response);
  const responseView = usePlaygroundStore((s) => s.responseView);
  const setResponseView = usePlaygroundStore((s) => s.setResponseView);
  const expanded = usePlaygroundStore((s) => s.expandedAnswerIds);
  const toggleExpanded = usePlaygroundStore((s) => s.toggleExpanded);
  const questionsValue = usePlaygroundStore((s) => s.questionsValue);
  const [copied, setCopied] = useState(false);

  if (!response) return null;
  const { provider, meta } = response;
  const entries = Object.entries(provider.answers ?? {});

  const handleCopyRaw = async () => {
    await navigator.clipboard.writeText(JSON.stringify(provider, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="response">
      <div className="response-head">
        <div className="response-title">
          Response <span className="dot">·</span> {formatRun(meta)}
        </div>
        <div className="response-actions">
          <button
            className={`icon-button small${responseView === 'structured' ? ' active' : ''}`}
            onClick={() => setResponseView('structured')}
            data-active={responseView === 'structured'}
            aria-label="Structured response"
          >
            <List size={17} strokeWidth={1.7} />
          </button>
          <button
            className={`icon-button small${responseView === 'json' ? ' active' : ''}`}
            onClick={() => setResponseView('json')}
            data-active={responseView === 'json'}
            aria-label="Raw JSON response"
          >
            <Code2 size={17} strokeWidth={1.7} />
          </button>
          <button className="icon-button small" aria-label="Dock response">
            <PanelRightOpen size={17} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {responseView === 'json' ? (
        <div className="response-raw">
          <button
            className="raw-copy-btn"
            onClick={handleCopyRaw}
            aria-label="Copy raw response"
            title="Copy raw response"
          >
            {copied ? <Check size={16} strokeWidth={1.8} /> : <Copy size={16} strokeWidth={1.8} />}
          </button>
          <pre>{JSON.stringify(provider, null, 2)}</pre>
        </div>
      ) : (
        <div className="response-table">
          <div className="resp-header-row">
            <span className="col-expand">⌄</span>
            <span className="col-key">Key &amp; instructions</span>
            <span className="col-meta">
              {meta.requestedModel} {meta.providerMs ?? 0}ms + {meta.overheadMs}ms
            </span>
            <span className="col-type">
              Primitive type <CircleHelp size={14} strokeWidth={1.7} />
            </span>
          </div>
          {entries.map(([key, answer]) => {
            const isExpanded = expanded.has(key);
            const question = questionsValue[key];
            const instruction =
              question && typeof question.instructions === 'string' && question.instructions.trim()
                ? question.instructions
                : key;
            const QuestionLabel = () => (
              <span className="q-monolabel" title={key}>
                {instruction}
              </span>
            );
            return (
              <div key={key} className={`resp-row${isExpanded ? ' expanded' : ''}`}>
                <div className="resp-row-main" onClick={() => toggleExpanded(key)}>
                  <span className="col-expand">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                  <span className="col-key">
                    <QuestionLabel />
                  </span>
                  <span className="col-meta">
                    <Summary answer={answer} />
                  </span>
                  <span className="col-type">
                    <span className="primitive-badge">{answer.type}</span>
                  </span>
                </div>
                {isExpanded && <AnswerDetails answer={answer} question={questionsValue[key]} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Summary({ answer }: { answer: Answer }) {
  if (answer.type === 'noul') {
    const p = Math.round(answer.noul * 100);
    return <NoulTrack p={answer.noul} label={`${p}% true`} />;
  }
  if (answer.type === 'choice') {
    const top = answer.choice;
    const prob = answer.probabilities[top] ?? 0;
    return (
      <span className="sum-choice">
        {top} · {Math.round(prob * 100)}% · conf {Math.round(answer.confidence * 100)}%
      </span>
    );
  }
  return (
    <span className="sum-score">
      {answer.score.toFixed(2)} · conf {Math.round(answer.confidence * 100)}%
    </span>
  );
}

function NoulTrack({ p, label }: { p: number; label: string }) {
  const pct = Math.min(100, Math.max(0, p * 100));
  const dominantTrue = p >= 0.5;
  return (
    <span className="noul-summary">
      <span className="noul-track" aria-hidden>
        <span className="noul-fill" style={{ width: `${pct}%` }} />
        <span
          className={`noul-marker ${dominantTrue ? 'true' : 'false'}`}
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </span>
      <span className="noul-label">{label}</span>
    </span>
  );
}

function hasCriterion(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function renderCriteria(label: string, value: unknown): ReactNode {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="criteria-line">
      <strong>{label}</strong> {typeof value === 'string' ? value : JSON.stringify(value)}
    </div>
  );
}

function AnswerDetails({ answer, question }: { answer: Answer; question?: unknown }) {
  if (answer.type === 'noul') {
    const a = answer as NoulAnswer;
    const pTrue = Math.round(a.noul * 100);
    const pFalse = Math.round((1 - a.noul) * 100);
    const q = (question as { criteria?: { true?: unknown; false?: unknown } } | undefined)?.criteria;
    return (
      <div className="answer-details">
        <div className="noul-detail-rows">
          <div className="noul-detail-row">
            <span>True</span>
            <NoulTrack p={a.noul} label={`${pTrue}% true`} />
          </div>
          <div className="noul-detail-row">
            <span>False</span>
            <NoulTrack p={1 - a.noul} label={`${pFalse}% false`} />
          </div>
        </div>
        {(hasCriterion(q?.true) || hasCriterion(q?.false)) && (
          <div className="criteria-info">
            {renderCriteria('True', q?.true)}
            {renderCriteria('False', q?.false)}
          </div>
        )}
      </div>
    );
  }
  if (answer.type === 'choice') {
    const a = answer as ChoiceAnswer;
    return (
      <div className="answer-details">
        {Object.entries(a.probabilities).map(([opt, prob]) => (
          <div key={opt} className={`prob-row${a.choice === opt ? ' selected' : ''}`}>
            <span className="prob-label">{opt}</span>
            <span className="prob-bar-wrap">
              <span className="prob-bar" style={{ width: `${Math.round(prob * 100)}%` }} />
            </span>
            <span className="prob-value">{Math.round(prob * 100)}%</span>
          </div>
        ))}
        <div className="confidence-line">Confidence: {Math.round(a.confidence * 100)}%</div>
      </div>
    );
  }
  const a = answer as ScoreAnswer;
  const maxIdx = Object.keys(a.legend).length - 1;
  return (
    <div className="answer-details">
      <div className="score-line">
        Score: {a.score.toFixed(2)}<span className="muted"> / {maxIdx}.00</span>
      </div>
      <div className="score-legend">
        {Object.entries(a.legend).map(([idx, label]) => (
          <div key={idx} className="score-legend-row">
            <span className="score-idx">{idx}</span>
            <span className="score-label-text">{String(label)}</span>
            <span className="score-prob">{Math.round((a.probabilities[idx] ?? 0) * 100)}%</span>
          </div>
        ))}
      </div>
      <div className="confidence-line">Confidence: {Math.round(a.confidence * 100)}%</div>
    </div>
  );
}