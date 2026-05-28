import { useEffect, useMemo, useState } from "react";
import type { Book } from "../types/book";
import type { CellType, ShelfConfig } from "../types/shelf";
import { formatCubbyDimensions, getCubbyDimensions } from "../utils/cubby";
import { formatPosition, formatSize } from "../utils/layout";

interface CubbyPanelProps {
  cubbyX: number;
  cubbyY: number;
  shelf: ShelfConfig;
  cellType: CellType;
  books: Book[];
  unplacedBooks: Book[];
  selectedBookId: string | null;
  onSelectBook: (book: Book) => void;
  onAddBook: () => void;
  onToggleCellType: () => void;
  onPlaceQueued: (orderedIds: string[]) => {
    placedCount: number;
    skippedIds: string[];
  };
}

export function CubbyPanel({
  cubbyX,
  cubbyY,
  shelf,
  cellType,
  books,
  unplacedBooks,
  selectedBookId,
  onSelectBook,
  onAddBook,
  onToggleCellType,
  onPlaceQueued,
}: CubbyPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const dims = getCubbyDimensions(shelf, cubbyX, cubbyY);
  const queueBooks = useMemo(
    () => queueIds.map((id) => unplacedBooks.find((b) => b.id === id)).filter(Boolean) as Book[],
    [queueIds, unplacedBooks],
  );

  useEffect(() => {
    setQueueIds([]);
  }, [cubbyX, cubbyY]);

  function addToQueue(id: string) {
    setQueueIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeFromQueue(id: string) {
    setQueueIds((prev) => prev.filter((x) => x !== id));
  }

  function moveInQueue(index: number, dir: -1 | 1) {
    setQueueIds((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function placeQueued() {
    const result = onPlaceQueued(queueIds);
    setQueueIds((prev) => prev.filter((id) => result.skippedIds.includes(id)));
  }

  return (
    <section className="panel cubby-panel">
      <h2>
        Cubby ({cubbyX}, {cubbyY})
      </h2>
      <p className="cell-type-badge">
        {cellType === "other"
          ? "Non-book cubby"
          : `${books.length} book(s) · ${formatCubbyDimensions(dims)}`}
      </p>

      {cellType === "book-slot" && (
        <>
          {books.length > 0 ? (
            <>
              <button
                type="button"
                className="advanced-toggle"
                onClick={() => setShowAdvanced((s) => !s)}
              >
                {showAdvanced ? "Hide details" : "Show details"}
              </button>
              <ul className="cubby-book-list">
                {books.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className={`cubby-book-item ${selectedBookId === b.id ? "active" : ""}`}
                      onClick={() => onSelectBook(b)}
                    >
                      <span className="book-list-title">{b.title}</span>
                      {showAdvanced && (
                        <span className="book-list-meta">
                          {formatPosition(b)} · {formatSize(b)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">No books yet. Add one or click a book in the cubby.</p>
          )}
          <button type="button" className="btn primary" onClick={onAddBook}>
            Add book to cubby
          </button>

          <hr />
          <h3>Place from inventory (ordered)</h3>
          {unplacedBooks.length === 0 ? (
            <p className="muted">No unplaced books in inventory.</p>
          ) : (
            <>
              <ul className="inventory-pick-list">
                {unplacedBooks.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className="cubby-book-item"
                      onClick={() => addToQueue(b.id)}
                    >
                      <span className="book-list-title">{b.title}</span>
                      {b.author && <span className="book-list-author">{b.author}</span>}
                    </button>
                  </li>
                ))}
              </ul>

              <p className="coord-hint">
                Queue order is left → right. Place will skip books that do not fit.
              </p>
              <ul className="queue-list">
                {queueBooks.map((b, idx) => (
                  <li key={b.id}>
                    <span className="book-list-title">{b.title}</span>
                    <span className="queue-actions">
                      <span className="mini-action" onClick={() => moveInQueue(idx, -1)}>
                        ↑
                      </span>
                      <span className="mini-action" onClick={() => moveInQueue(idx, 1)}>
                        ↓
                      </span>
                      <span className="mini-action" onClick={() => removeFromQueue(b.id)}>
                        remove
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn primary"
                onClick={placeQueued}
                disabled={queueIds.length === 0}
              >
                Place queued into this cubby
              </button>
            </>
          )}
        </>
      )}

      <hr />
      <button type="button" className="btn subtle" onClick={onToggleCellType}>
        Toggle: book slot ↔ other
      </button>
    </section>
  );
}
