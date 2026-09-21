import { usePlaygroundStore } from '../../stores/playgroundStore';
import { StatePanel } from './StatePanel';
import { QuestionsPanel } from './QuestionsPanel';
import { PlaygroundFooter } from './PlaygroundFooter';
import { RightRail } from './RightRail';

export function PlaygroundWorkspace() {
  const workspaceLayout = usePlaygroundStore((s) => s.workspaceLayout);

  return (
    <div className={`playground-workspace${workspaceLayout === 'alternate' ? ' alternate' : ''}`}>
      <div className="request-pane">
        <StatePanel />
        <QuestionsPanel />
        <PlaygroundFooter />
      </div>
      <RightRail />
    </div>
  );
}