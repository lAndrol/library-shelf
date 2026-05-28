import type { Book } from "../types/book";
import { formatPosition, formatSize } from "../utils/layout";

interface BookListProps {
  books: Book[];
  query: string;
  onQueryChange: (q: string) => void;
  selectedId: string | null;
  onSelect: (book: Book) => void;
}

export function BookList({
  books,
  query,
  onQueryChange,
  selectedId,
  onSelect,
}: BookListProps) {
  return (
    <section className="panel book-list-panel">
      <h2>All books</h2>
      <input
        className="search-input"
        placeholder="Search title, author, ISBN…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {books.length === 0 ? (
        <p className="muted">No books match your search.</p>
      ) : (
        <ul className="book-list">
          {books.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={`book-list-item ${selectedId === b.id ? "active" : ""}`}
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
