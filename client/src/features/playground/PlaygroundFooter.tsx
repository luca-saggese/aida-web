import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import { jsonIsValid } from './validation';
import { api, ApiError } from '../../lib/api';
import { showErrorToast } from '../../components/ToastHost';

export function PlaygroundFooter() {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
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

  useEffect(() => {
    let active = true;
    void api.getInferenceModels()
      .then(({ models }) => {
        if (!active) return;
        setAvailableModels(models);
        if (models.length > 0 && !models.includes(selectedModels[0] ?? '')) {
          setSelectedModels([models[0]]);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        showErrorToast(err instanceof ApiError ? err.message : 'Unable to load models');
      });
    return () => { active = false; };
  }, [setSelectedModels]);

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
        model: selectedModels[0] ?? availableModels[0] ?? '',
      });
      setResponse(res);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Evaluation failed';
      setRunError(message);
      showErrorToast(message);
    }
  };

  return (
    <footer className="playground-footer">
      <button className="add-model-btn" aria-label="Add model" onClick={() => {}}>
        <Plus size={22} strokeWidth={1.8} />
      </button>
      <select
        className="model-select"
        value={selectedModels[0] ?? availableModels[0] ?? ''}
        aria-label="Model"
        disabled={availableModels.length === 0}
        onChange={(e) => setSelectedModels([e.target.value])}
      >
        {availableModels.map((m) => (
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