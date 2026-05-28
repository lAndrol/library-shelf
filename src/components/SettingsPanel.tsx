import type { ShelfConfig } from "../types/shelf";
import { formatCubbyDimensions } from "../utils/cubby";
import { CubbySizeForm } from "./CubbySizeForm";

interface SettingsPanelProps {
  shelf: ShelfConfig;
  onSaveDefault: (dims: {
    widthMm: number;
    heightMm: number;
    depthMm: number;
  }) => void;
}

export function SettingsPanel({ shelf, onSaveDefault }: SettingsPanelProps) {
  return (
    <section className="panel settings-panel">
      <h2>Shelf settings</h2>
      <p className="muted">
        Set the real inner size of your cubbies so books scale and fit correctly in the
        simulation.
      </p>

      <CubbySizeForm
        title="Default cubby size (all slots)"
        hint={`Applies to every cubby without its own size. Current: ${formatCubbyDimensions({
          widthMm: shelf.cubbyWidthMm,
          heightMm: shelf.cubbyHeightMm,
          depthMm: shelf.cubbyDepthMm,
        })}`}
        initial={{
          widthMm: shelf.cubbyWidthMm,
          heightMm: shelf.cubbyHeightMm,
          depthMm: shelf.cubbyDepthMm,
        }}
        onSave={onSaveDefault}
      />
    </section>
  );
}
