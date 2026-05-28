import type { Book } from "../types/book";
import type { CellType } from "../types/shelf";
import { formatPosition, formatSize } from "../utils/layout";

interface CubbyPanelProps {
  cubbyX: number;
  cubbyY: number;
  cellType: CellType;
  books: Book[];
  selectedBookId: string | null;
  onSelectBook: (book: Book) => void;
  onAddBook: () => void;
  onToggleCellType: () => void;
}

export function CubbyPanel({
  cubbyX,
  cubbyY,
  cellType,
  books,
  selectedBookId,
  onSelectBook,
  onAddBook,
  onToggleCellType,
}: CubbyPanelProps) {
  return (
    <section className="panel cubby-panel">
      <h2>
        Cubby ({cubbyX}, {cubbyY})
      </h2>
      <p className="cell-type-badge">
        {cellType === "other" ? "Non-book cubby" : `${books.length} book(s)`}
      </p>

      {cellType === "book-slot" && (
        <>
          {books.length > 0 ? (
            <ul className="cubby-book-list">
              {books.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className={`cubby-book-item ${selectedBookId === b.id ? "active" : ""}`}
                    onClick={() => onSelectBook(b)}
                  >
                    <span className="book-list-title">{b.title}</span>
                    <span className="book-list-meta">
                      {formatPosition(b)} · {formatSize(b)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No books yet. Add one or click a book in the cubby.</p>
          )}
          <button type="button" className="btn primary" onClick={onAddBook}>
            Add book to cubby
          </button>
        </>
      )}

      <hr />
      <button type="button" className="btn subtle" onClick={onToggleCellType}>
        Toggle: book slot ↔ other
      </button>
    </section>
  );
}
