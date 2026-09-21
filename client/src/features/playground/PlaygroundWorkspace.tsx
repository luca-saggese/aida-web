import { usePlaygroundStore } from '../../stores/playgroundStore';
import { PlaygroundTopbar } from './PlaygroundTopbar';
import { StatePanel } from './StatePanel';
import { QuestionsPanel } from './QuestionsPanel';
import { PlaygroundFooter } from './PlaygroundFooter';
import { RightRail } from './RightRail';

export function PlaygroundWorkspace() {
  const workspaceLayout = usePlaygroundStore((s) => s.workspaceLayout);

  return (
    <div className={`playground-workspace${workspaceLayout === 'alternate' ? ' alternate' : ''}`}>
      <div className="request-pane">
        <PlaygroundTopbar />
        <div className={`request-panels${workspaceLayout === 'alternate' ? ' alternate' : ''}`}>
          <StatePanel />
          <QuestionsPanel />
        </div>
        <PlaygroundFooter />
      </div>
      <RightRail />
    </div>
  );
}