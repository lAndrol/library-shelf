import type { Book } from "../types/book";
import type { ShelfConfig } from "../types/shelf";
import { formatCubbyDimensions, getCubbyDimensions } from "../utils/cubby";
import { bookTargetMm, formatPosition, formatSize } from "../utils/layout";

interface BookDetailProps {
  book: Book;
  shelf: ShelfConfig;
  onPresent: () => void;
  onEdit: () => void;
  presenting: boolean;
}

export function BookDetail({
  book,
  shelf,
  onPresent,
  onEdit,
  presenting,
}: BookDetailProps) {
  const target = bookTargetMm(book, shelf);
  const cubby = getCubbyDimensions(shelf, book.cubbyX, book.cubbyY);

  return (
    <section className="panel book-detail">
      <h2>{book.title}</h2>
      {book.author && <p>{book.author}</p>}
      {book.isbn && <p className="muted">ISBN: {book.isbn}</p>}
      <dl className="meta-list">
        <dt>Position</dt>
        <dd>{formatPosition(book)}</dd>
        <dt>Cubby size</dt>
        <dd>{formatCubbyDimensions(cubby)}</dd>
        <dt>Book size</dt>
        <dd>{formatSize(book)}</dd>
        <dt>Gantry target (center)</dt>
        <dd>
          {target.x.toFixed(1)}, {target.y.toFixed(1)} mm
        </dd>
      </dl>
      {book.notes && <p className="notes">{book.notes}</p>}
      <div className="detail-actions">
        <button
          type="button"
          className="btn primary"
          onClick={onPresent}
          disabled={presenting}
        >
          {presenting ? "Presenting…" : "Present this book"}
        </button>
        <button type="button" className="btn" onClick={onEdit}>
          Edit
        </button>
      </div>
    </section>
  );
}
