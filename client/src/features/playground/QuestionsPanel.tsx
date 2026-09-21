import { CircleHelp } from 'lucide-react';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import { JsonEditor } from '../../components/JsonEditor';
import { QuestionsStructured } from './StructuredQuestions';
import { jsonIsValid } from './validation';

export function QuestionsPanel() {
  const requestView = usePlaygroundStore((s) => s.requestView);
  const setRequestView = usePlaygroundStore((s) => s.setRequestView);
  const questionsText = usePlaygroundStore((s) => s.questionsText);
  const validationIssues = usePlaygroundStore((s) => s.validationIssues);
  const setQuestionsValue = usePlaygroundStore((s) => s.setQuestionsValue);
  const setQuestionsText = usePlaygroundStore((s) => s.setQuestionsText);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(questionsText);
      setQuestionsValue(parsed as never);
    } catch {
      // Keep as-is.
    }
  };

  return (
    <section className="questions-panel" aria-label="Questions">
      <header className="panel-header">
        <span className="panel-title">Questions</span>
        <div className="panel-actions">
          <button className="format-btn" onClick={handleFormat}>
            Format
          </button>
          <div className={`issue-badge${validationIssues.length > 0 ? ' has-issues' : ''}`}>
            <CircleHelp size={16} strokeWidth={1.7} className="circle-help" />
            {validationIssues.length}
          </div>
          <div className="view-toggle" role="group" aria-label="Questions editor mode">
            <button className={requestView === 'structured' ? 'active' : ''} onClick={() => setRequestView('structured')}>
              structured
            </button>
            <button className={requestView === 'json' ? 'active' : ''} onClick={() => setRequestView('json')}>
              {'</>'}
            </button>
          </div>
        </div>
      </header>
      <div className={`editor-body${!jsonIsValid(questionsText) ? ' invalid' : ''}`}>
        {requestView === 'json' ? (
          <JsonEditor
            value={questionsText}
            onChange={(v) => setQuestionsText(v)}
            invalid={!jsonIsValid(questionsText)}
          />
        ) : (
          <QuestionsStructured />
        )}
      </div>
    </section>
  );
}