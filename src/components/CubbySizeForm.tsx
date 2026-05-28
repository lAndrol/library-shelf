import { useState, type FormEvent } from "react";
import type { CubbyDimensions } from "../types/shelf";
import { formatCubbyDimensions } from "../utils/cubby";

interface CubbySizeFormProps {
  title: string;
  hint?: string;
  initial: CubbyDimensions;
  showUseDefault?: boolean;
  usingDefault?: boolean;
  onSave: (dims: CubbyDimensions) => void;
  onUseDefault?: () => void;
}

export function CubbySizeForm({
  title,
  hint,
  initial,
  showUseDefault,
  usingDefault,
  onSave,
  onUseDefault,
}: CubbySizeFormProps) {
  const [widthMm, setWidthMm] = useState(initial.widthMm);
  const [heightMm, setHeightMm] = useState(initial.heightMm);
  const [depthMm, setDepthMm] = useState(initial.depthMm);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      onSave({ widthMm, heightMm, depthMm });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <form className="cubby-size-form" onSubmit={handleSubmit}>
      <h4>{title}</h4>
      {hint && <p className="coord-hint">{hint}</p>}
      {usingDefault !== undefined && (
        <p className="cubby-size-status">
          {usingDefault ? "Using shelf default" : `Custom: ${formatCubbyDimensions(initial)}`}
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
      <div className="coord-row coord-row-3">
        <label>
          Width
          <input
            type="number"
            min={1}
            step={1}
            value={widthMm}
            onChange={(e) => setWidthMm(Number(e.target.value))}
          />
        </label>
        <label>
          Height
          <input
            type="number"
            min={1}
            step={1}
            value={heightMm}
            onChange={(e) => setHeightMm(Number(e.target.value))}
          />
        </label>
        <label>
          Depth
          <input
            type="number"
            min={1}
            step={1}
            value={depthMm}
            onChange={(e) => setDepthMm(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="coord-hint">Inner opening in millimeters (W × H × D).</p>
      <div className="form-actions">
        <button type="submit" className="btn primary">
          Save cubby size
        </button>
        {showUseDefault && onUseDefault && !usingDefault && (
          <button type="button" className="btn subtle" onClick={onUseDefault}>
            Use shelf default
          </button>
        )}
      </div>
    </form>
  );
}
