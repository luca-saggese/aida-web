import { usePlaygroundStore } from '../../stores/playgroundStore';
import { ExampleRail } from './ExampleRail';
import { ResponsePanel } from './ResponsePanel';

export function RightRail() {
  const response = usePlaygroundStore((s) => s.response);
  const examplesOpen = usePlaygroundStore((s) => s.examplesOpen);

  if (response) {
    return (
      <div className="right-rail">
        <ResponsePanel />
      </div>
    );
  }

  if (!examplesOpen) {
    return <div className="right-rail empty-rail" />;
  }

  return (
    <div className="right-rail">
      <ExampleRail />
    </div>
  );
}