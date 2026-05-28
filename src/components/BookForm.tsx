import { useState, type FormEvent } from "react";
import { DEFAULT_BOOK_SIZE, type BookInput } from "../types/book";
import type { ShelfConfig } from "../types/shelf";
import { formatCubbyDimensions, getCubbyDimensions } from "../utils/cubby";

interface BookFormProps {
  shelf: ShelfConfig;
  initial?: Partial<BookInput> & { id?: string };
  onSave: (input: BookInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

export function BookForm({
  shelf,
  initial,
  onSave,
  onCancel,
  onDelete,
  submitLabel = "Save",
}: BookFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [isbn, setIsbn] = useState(initial?.isbn ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [cubbyX, setCubbyX] = useState(initial?.cubbyX ?? 0);
  const [cubbyY, setCubbyY] = useState(initial?.cubbyY ?? 0);
  const [posX, setPosX] = useState(initial?.posX ?? 0);
  const [posZ, setPosZ] = useState(initial?.posZ ?? 0);
  const [widthMm, setWidthMm] = useState(
    initial?.widthMm ?? DEFAULT_BOOK_SIZE.widthMm,
  );
  const [heightMm, setHeightMm] = useState(
    initial?.heightMm ?? DEFAULT_BOOK_SIZE.heightMm,
  );
  const [depthMm, setDepthMm] = useState(
    initial?.depthMm ?? DEFAULT_BOOK_SIZE.depthMm,
  );
  const [error, setError] = useState<string | null>(null);

  const cubbyDims = getCubbyDimensions(shelf, cubbyX, cubbyY);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      onSave({
        title,
        author,
        isbn,
        notes,
        cubbyX,
        cubbyY,
        posX,
        posY: 0,
        posZ,
        widthMm,
        heightMm,
        depthMm,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h3>{initial?.id ? "Edit book" : "Add book"}</h3>
      {error && <p className="form-error">{error}</p>}
      <label>
        Title *
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Author
        <input value={author} onChange={(e) => setAuthor(e.target.value)} />
      </label>
      <label>
        ISBN
        <input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
      </label>
      <label>
        Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>

      <fieldset className="form-fieldset">
        <legend>Cubby (5×5)</legend>
        <div className="coord-row">
          <label>
            Col X
            <input
              type="number"
              min={0}
              max={4}
              value={cubbyX}
              onChange={(e) => setCubbyX(Number(e.target.value))}
            />
          </label>
          <label>
            Row Y
            <input
              type="number"
              min={0}
              max={4}
              value={cubbyY}
              onChange={(e) => setCubbyY(Number(e.target.value))}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Position inside cubby (mm)</legend>
        <p className="coord-hint">
          Books are grounded to the cubby floor. Set horizontal X and depth Z only.
          Cubby: {formatCubbyDimensions(cubbyDims)}
        </p>
        <div className="coord-row">
          <label>
            posX
            <input
              type="number"
              min={0}
              step={1}
              value={posX}
              onChange={(e) => setPosX(Number(e.target.value))}
            />
          </label>
          <label>
            posZ (depth)
            <input
              type="number"
              min={0}
              step={1}
              value={posZ}
              onChange={(e) => setPosZ(Number(e.target.value))}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Book size (mm)</legend>
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
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="btn primary">
          {submitLabel}
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        {onDelete && (
          <button type="button" className="btn danger" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
