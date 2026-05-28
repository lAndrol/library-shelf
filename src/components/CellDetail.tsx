import type { Book } from "../types/book";
import type { CellType } from "../types/shelf";

interface CellDetailProps {
  x: number;
  y: number;
  cellType: CellType;
  book: Book | undefined;
  onPresent: () => void;
  onAdd: () => void;
  onEdit: () => void;
  onToggleCellType: () => void;
  presenting: boolean;
}

export function CellDetail({
  x,
  y,
  cellType,
  book,
  onPresent,
  onAdd,
  onEdit,
  onToggleCellType,
  presenting,
}: CellDetailProps) {
  return (
    <section className="panel cell-detail">
      <h2>
        Cell ({x}, {y})
      </h2>
      <p className="cell-type-badge">
        {cellType === "other" ? "Non-book cubby" : "Book slot"}
      </p>

      {cellType === "other" ? (
        <p className="muted">This cubby is not used for books. Toggle type below if that changed.</p>
      ) : book ? (
        <>
          <h3 className="book-detail-title">{book.title}</h3>
          {book.author && <p>{book.author}</p>}
          {book.isbn && <p className="muted">ISBN: {book.isbn}</p>}
          {book.notes && <p className="notes">{book.notes}</p>}
          <div className="detail-actions">
            <button
              type="button"
              className="btn primary"
              onClick={onPresent}
              disabled={presenting}
            >
              {presenting ? "Presenting…" : "Present book"}
            </button>
            <button type="button" className="btn" onClick={onEdit}>
              Edit
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="muted">No book in this slot.</p>
          <button type="button" className="btn primary" onClick={onAdd}>
            Add book here
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
