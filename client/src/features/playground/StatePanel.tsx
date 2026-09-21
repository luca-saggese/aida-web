import { usePlaygroundStore } from '../../stores/playgroundStore';
import { JsonEditor } from '../../components/JsonEditor';
import { jsonIsValid } from './validation';

function StateStructured() {
  const stateValue = usePlaygroundStore((s) => s.stateValue);
  const setStateValue = usePlaygroundStore((s) => s.setStateValue);

  const value =
    typeof stateValue === 'object' && stateValue !== null && !Array.isArray(stateValue)
      ? ((stateValue as Record<string, unknown>).message as string) ?? ''
      : '';

  return (
    <div className="state-structured">
      <div className="q-field">
        <label>message</label>
        <textarea
          className="state-message-input"
          value={value}
          onChange={(e) => setStateValue({ message: e.target.value })}
          placeholder="Add context for GoTraxx to evaluate"
        />
      </div>
    </div>
  );
}

export function StatePanel() {
  const stateView = usePlaygroundStore((s) => s.stateView);
  const setStateView = usePlaygroundStore((s) => s.setStateView);
  const stateText = usePlaygroundStore((s) => s.stateText);

  return (
    <section className="state-panel" aria-label="State">
      <header className="panel-header">
        <span className="panel-title">State</span>
        <div className="panel-actions">
          <div className="view-toggle" role="group" aria-label="State editor mode">
            <button className={stateView === 'structured' ? 'active' : ''} onClick={() => setStateView('structured')}>
              structured
            </button>
            <button className={stateView === 'json' ? 'active' : ''} onClick={() => setStateView('json')}>
              {'</>'}
            </button>
          </div>
        </div>
      </header>
      {stateView === 'json' ? (
        <div className={`editor-body${!jsonIsValid(stateText) ? ' invalid' : ''}`}>
          <JsonEditor value={stateText} onChange={(v) => usePlaygroundStore.getState().setStateText(v)} invalid={!jsonIsValid(stateText)} />
        </div>
      ) : (
        <StateStructured />
      )}
    </section>
  );
}