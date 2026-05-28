import type { Book } from "../types/book";
import type { CellType, ShelfConfig } from "../types/shelf";
import { GRID_COLS, GRID_ROWS } from "../types/shelf";
import { CubbyView } from "./CubbyView";

interface ShelfGridProps {
  books: Book[];
  shelf: ShelfConfig;
  cellTypes: Record<string, CellType>;
  selectedCubby: { x: number; y: number } | null;
  selectedBookId: string | null;
  highlightedBookIds: Set<string>;
  onSelectCubby: (x: number, y: number) => void;
  onSelectBook: (book: Book) => void;
}

export function ShelfGrid({
  books,
  shelf,
  cellTypes,
  selectedCubby,
  selectedBookId,
  highlightedBookIds,
  onSelectCubby,
  onSelectBook,
}: ShelfGridProps) {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      cells.push({ x, y });
    }
  }

  return (
    <div
      className="shelf-grid"
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
      }}
    >
      {cells.map(({ x, y }) => {
        const key = `${x},${y}`;
        const type = cellTypes[key] ?? "book-slot";
        const cubbyBooks = books.filter((b) => b.cubbyX === x && b.cubbyY === y);
        const isCubbySelected =
          selectedCubby?.x === x && selectedCubby?.y === y;

        return (
          <CubbyView
            key={key}
            cubbyX={x}
            cubbyY={y}
            books={cubbyBooks}
            shelf={shelf}
            cellType={type}
            isCubbySelected={isCubbySelected}
            selectedBookId={selectedBookId}
            highlightedBookIds={highlightedBookIds}
            onSelectCubby={() => onSelectCubby(x, y)}
            onSelectBook={onSelectBook}
          />
        );
      })}
    </div>
  );
}
