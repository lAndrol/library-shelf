import type { Book } from "../types/book";
import type { ShelfConfig } from "../types/shelf";
import { bookStylePercent, formatSize } from "../utils/layout";

interface CubbyViewProps {
  cubbyX: number;
  cubbyY: number;
  books: Book[];
  shelf: ShelfConfig;
  cellType: "book-slot" | "other";
  isCubbySelected: boolean;
  selectedBookId: string | null;
  onSelectCubby: () => void;
  onSelectBook: (book: Book) => void;
}

export function CubbyView({
  cubbyX,
  cubbyY,
  books,
  shelf,
  cellType,
  isCubbySelected,
  selectedBookId,
  onSelectCubby,
  onSelectBook,
}: CubbyViewProps) {
  const sorted = [...books].sort((a, b) => b.posZ - a.posZ);

  return (
    <div
      className={[
        "cubby",
        cellType === "other" ? "cubby-other" : "cubby-slot",
        isCubbySelected ? "cubby-selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelectCubby}
      onKeyDown={(e) => e.key === "Enter" && onSelectCubby()}
      role="button"
      tabIndex={0}
      title={`Cubby ${cubbyX},${cubbyY}`}
    >
      <span className="cubby-coord">
        {cubbyX},{cubbyY}
      </span>
      {cellType === "other" ? (
        <span className="cubby-label">Other</span>
      ) : (
        <div className="cubby-stage">
          {sorted.length === 0 ? (
            <span className="cubby-empty">Empty</span>
          ) : (
            sorted.map((book) => {
              const style = bookStylePercent(book, shelf);
              const isBookSelected = selectedBookId === book.id;
              return (
                <button
                  key={book.id}
                  type="button"
                  className={[
                    "book-block",
                    isBookSelected ? "book-block-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    left: style.left,
                    top: style.top,
                    width: style.width,
                    height: style.height,
                    zIndex: style.zIndex,
                  }}
                  title={`${book.title} · ${formatSize(book)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBook(book);
                  }}
                >
                  <span className="book-block-title">{book.title}</span>
                  <span className="book-block-size">{formatSize(book)}</span>
                </button>
              );
            })
          )}
        </div>
      )}
      {cellType === "book-slot" && books.length > 0 && (
        <span className="cubby-count">{books.length}</span>
      )}
    </div>
  );
}
