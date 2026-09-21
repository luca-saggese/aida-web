import { usePlaygroundStore } from '../../stores/playgroundStore';
import { JsonEditor } from '../../components/JsonEditor';
import { jsonIsValid } from './validation';

export function StatePanel() {
  const requestView = usePlaygroundStore((s) => s.requestView);
  const setRequestView = usePlaygroundStore((s) => s.setRequestView);
  const stateText = usePlaygroundStore((s) => s.stateText);

  return (
    <section className="state-panel" aria-label="State">
      <header className="panel-header">
        <span className="panel-title">State</span>
        <div className="panel-actions">
          <div className="view-toggle" role="group" aria-label="State editor mode">
            <button className={requestView === 'structured' ? 'active' : ''} onClick={() => setRequestView('structured')}>
              structured
            </button>
            <button className={requestView === 'json' ? 'active' : ''} onClick={() => setRequestView('json')}>
              {'</>'}
            </button>
          </div>
        </div>
      </header>
      <div className={`editor-body${!jsonIsValid(stateText) ? ' invalid' : ''}`}>
        <JsonEditor value={stateText} onChange={(v) => usePlaygroundStore.getState().setStateText(v)} invalid={!jsonIsValid(stateText)} />
      </div>
    </section>
  );
}