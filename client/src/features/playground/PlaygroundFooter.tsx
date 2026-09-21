import { Plus } from 'lucide-react';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import { jsonIsValid } from './validation';
import { api, ApiError } from '../../lib/api';

const AVAILABLE_MODELS = ['aida-latest', 'aida-preview', 'aida-1.13.0'];

export function PlaygroundFooter() {
  const selectedModels = usePlaygroundStore((s) => s.selectedModels);
  const setSelectedModels = usePlaygroundStore((s) => s.setSelectedModels);
  const stateText = usePlaygroundStore((s) => s.stateText);
  const stateValue = usePlaygroundStore((s) => s.stateValue);
  const questionsValue = usePlaygroundStore((s) => s.questionsValue);
  const validationIssues = usePlaygroundStore((s) => s.validationIssues);
  const runStatus = usePlaygroundStore((s) => s.runStatus);
  const setRunning = usePlaygroundStore((s) => s.setRunning);
  const setResponse = usePlaygroundStore((s) => s.setResponse);
  const setRunError = usePlaygroundStore((s) => s.setRunError);

  const stateValid = jsonIsValid(stateText);
  const questionsValid = jsonIsValid(usePlaygroundStore.getState().questionsText);
  const hasQuestions = Object.keys(questionsValue).length > 0;
  const running = runStatus === 'running';

  const canRun = stateValid && questionsValid && hasQuestions && validationIssues.length === 0 && !running;

  const run = async () => {
    if (!canRun) return;
    setRunning();
    try {
      const res = await api.evaluate({
        state: stateValue,
        questions: questionsValue,
        model: selectedModels[0] ?? 'aida-latest',
      });
      setResponse(res);
    } catch (err) {
      setRunError(err instanceof ApiError ? err.message : 'Evaluation failed');
    }
  };

  return (
    <footer className="playground-footer">
      <button className="add-model-btn" aria-label="Add model" onClick={() => {}}>
        <Plus size={22} strokeWidth={1.8} />
      </button>
      <select
        className="model-select"
        value={selectedModels[0] ?? 'aida-latest'}
        aria-label="Model"
        onChange={(e) => setSelectedModels([e.target.value])}
      >
        {AVAILABLE_MODELS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <button className="run-btn" onClick={run} disabled={!canRun} aria-label="Run">
        {running ? 'Running…' : 'Run'}
      </button>
    </footer>
  );
}