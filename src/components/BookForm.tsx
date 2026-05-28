import { useState, type FormEvent } from "react";
import type { BookInput } from "../types/book";

interface BookFormProps {
  initial?: Partial<BookInput> & { id?: string };
  onSave: (input: BookInput) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
}

export function BookForm({
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
  const [gridX, setGridX] = useState(initial?.gridX ?? 0);
  const [gridY, setGridY] = useState(initial?.gridY ?? 0);
  const [error, setError] = useState<string | null>(null);

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
        gridX,
        gridY,
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
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </label>
      <div className="coord-row">
        <label>
          X (col)
          <input
            type="number"
            min={0}
            max={4}
            value={gridX}
            onChange={(e) => setGridX(Number(e.target.value))}
          />
        </label>
        <label>
          Y (row)
          <input
            type="number"
            min={0}
            max={4}
            value={gridY}
            onChange={(e) => setGridY(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="coord-hint">(0, 0) is top-left. Grid is 5×5.</p>
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
