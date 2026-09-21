import { FlaskConical, Link2, Rows2, Columns2, X } from 'lucide-react';
import { usePlaygroundStore } from '../../stores/playgroundStore';
import { api } from '../../lib/api';
import './playground.css';

export function PlaygroundTopbar() {
  const clearAll = usePlaygroundStore((s) => s.clearAll);
  const workspaceLayout = usePlaygroundStore((s) => s.workspaceLayout);
  const setWorkspaceLayout = usePlaygroundStore((s) => s.setWorkspaceLayout);
  const stateValue = usePlaygroundStore((s) => s.stateValue);
  const questionsValue = usePlaygroundStore((s) => s.questionsValue);
  const selectedModels = usePlaygroundStore((s) => s.selectedModels);

  const canClear = Object.keys(questionsValue).length > 0;

  const handleClear = () => {
    clearAll();
  };

  const handleShare = async () => {
    const { shareId } = await api.createShare({
      state: stateValue,
      questions: questionsValue,
      selectedModels,
      layout: workspaceLayout,
    });
    const url = `${window.location.origin}/playground?share=${shareId}`;
    await navigator.clipboard.writeText(url);
    // Simple UX feedback.
    window.alert(`Share link copied to clipboard:\n${url}`);
  };

  return (
    <header className="playground-topbar">
      <div className="topbar-title">
        <FlaskConical size={21} strokeWidth={1.7} />
        <span>Playground</span>
      </div>
      <div className="topbar-actions">
        <button className="clear-btn" onClick={handleClear} disabled={!canClear} aria-label="Clear playground">
          Clear
        </button>
        <button className="share-btn" onClick={handleShare} aria-label="Share">
          <Link2 size={17} strokeWidth={1.7} />
          Share
        </button>
        <button
          className={`icon-button layout-btn${workspaceLayout === 'default' ? ' active' : ''}`}
          onClick={() => setWorkspaceLayout('default')}
          aria-label="Default layout"
          data-active={workspaceLayout === 'default'}
        >
          <Rows2 size={20} strokeWidth={1.7} />
        </button>
        <button
          className={`icon-button layout-btn${workspaceLayout === 'alternate' ? ' active' : ''}`}
          onClick={() => setWorkspaceLayout('alternate')}
          aria-label="Alternate layout"
          data-active={workspaceLayout === 'alternate'}
        >
          <Columns2 size={20} strokeWidth={1.7} />
        </button>
      </div>
    </header>
  );
}