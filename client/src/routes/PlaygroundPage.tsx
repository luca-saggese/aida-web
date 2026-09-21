import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlaygroundTopbar } from '../features/playground/PlaygroundTopbar';
import { PlaygroundWorkspace } from '../features/playground/PlaygroundWorkspace';
import { usePlaygroundStore } from '../stores/playgroundStore';
import { api } from '../lib/api';
import { validateQuestions } from '../features/playground/validation';
import './PlaygroundPage.css';

export function PlaygroundPage() {
  const setQuestionsValue = usePlaygroundStore((s) => s.setQuestionsValue);
  const setStateValue = usePlaygroundStore((s) => s.setStateValue);
  const [searchParams] = useSearchParams();

  const shareId = searchParams.get('share');

  useEffect(() => {
    if (!shareId) return;
    api
      .getShare(shareId)
      .then(({ share }) => {
        if (share.state != null) setStateValue(share.state);
        if (share.questions != null) setQuestionsValue(share.questions as never);
      })
      .catch(() => {
        // Ignore share load errors.
      });
  }, [shareId, setStateValue, setQuestionsValue]);

  // Validate questions whenever they change.
  const questionsValue = usePlaygroundStore((s) => s.questionsValue);
  const setValidationIssues = usePlaygroundStore((s) => s.setValidationIssues);
  useEffect(() => {
    setValidationIssues(validateQuestions(questionsValue));
  }, [questionsValue, setValidationIssues]);

  return (
    <div className="playground-page">
      <PlaygroundTopbar />
      <PlaygroundWorkspace />
    </div>
  );
}