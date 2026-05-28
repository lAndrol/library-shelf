import type { Book } from "../types/book";
import { DEFAULT_BOOK_SIZE, type InventoryBookInput } from "../types/book";
import { formatPosition, formatSize } from "../utils/layout";
import { useState } from "react";

interface BookListProps {
  books: Book[];
  selectedId: string | null;
  highlightedBookIds: Set<string>;
  typedQuery: string;
  onSelect: (book: Book) => void;
  onAddInventory: (input: InventoryBookInput) => void;
}

export function BookList({
  books,
  selectedId,
  highlightedBookIds,
  typedQuery,
  onSelect,
  onAddInventory,
}: BookListProps) {
  const hasQuery = typedQuery.trim().length > 0;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [widthMm, setWidthMm] = useState<number>(DEFAULT_BOOK_SIZE.widthMm);
  const [heightMm, setHeightMm] = useState<number>(DEFAULT_BOOK_SIZE.heightMm);
  const [depthMm, setDepthMm] = useState<number>(DEFAULT_BOOK_SIZE.depthMm);
  const [error, setError] = useState<string | null>(null);

  function submitInventory() {
    setError(null);
    try {
      onAddInventory({
        title,
        author,
        isbn: "",
        notes: "",
        widthMm,
        heightMm,
        depthMm,
      });
      setTitle("");
      setAuthor("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add.");
    }
  }

  return (
    <section className="panel book-list-panel">
      <h2>All books</h2>
      <div className="inventory-quick-add">
        <input
          className="search-input"
          placeholder="New book title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="search-input"
          placeholder="Author (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <div className="coord-row coord-row-3">
          <label>
            Width (mm)
            <input
              className="search-input"
              type="number"
              min={1}
              step={1}
              value={widthMm}
              onChange={(e) => setWidthMm(Number(e.target.value))}
            />
          </label>
          <label>
            Height (mm)
            <input
              className="search-input"
              type="number"
              min={1}
              step={1}
              value={heightMm}
              onChange={(e) => setHeightMm(Number(e.target.value))}
            />
          </label>
          <label>
            Depth (mm)
            <input
              className="search-input"
              type="number"
              min={1}
              step={1}
              value={depthMm}
              onChange={(e) => setDepthMm(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn primary" onClick={submitInventory}>
            Add to inventory
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
      <p className="panel-hint">
        Type anywhere to search by title or author. Backspace edits, Esc clears.
      </p>
      {hasQuery && (
        <p className="live-search-status">
          Query: <span>{typedQuery}</span> · Matches: {highlightedBookIds.size}
        </p>
      )}
      {books.length === 0 ? (
        <p className="muted">No books match your search.</p>
      ) : (
        <ul className="book-list">
          {books.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={`book-list-item ${selectedId === b.id ? "active" : ""} ${
                  highlightedBookIds.has(b.id) ? "highlighted" : ""
                }`}
                onClick={() => onSelect(b)}
              >
                <span className="book-list-title">{b.title}</span>
                {b.author && <span className="book-list-author">{b.author}</span>}
                <span className="book-list-coord">
                  {formatPosition(b)} · {formatSize(b)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
