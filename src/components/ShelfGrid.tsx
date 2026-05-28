import type { Book } from "../types/book";
import type { CellType } from "../types/shelf";
import { GRID_COLS, GRID_ROWS } from "../types/shelf";

interface ShelfGridProps {
  books: Book[];
  cellTypes: Record<string, CellType>;
  selected: { x: number; y: number } | null;
  onSelectCell: (x: number, y: number) => void;
}

export function ShelfGrid({
  books,
  cellTypes,
  selected,
  onSelectCell,
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
        const book = books.find((b) => b.gridX === x && b.gridY === y);
        const isSelected = selected?.x === x && selected?.y === y;

        return (
          <button
            key={key}
            type="button"
            className={[
              "shelf-cell",
              type === "other" ? "cell-other" : "cell-slot",
              book ? "cell-occupied" : "cell-empty",
              isSelected ? "cell-selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelectCell(x, y)}
            title={`(${x}, ${y})`}
          >
            <span className="cell-coord">
              {x},{y}
            </span>
            {type === "other" ? (
              <span className="cell-label">Other</span>
            ) : book ? (
              <span className="cell-title">{book.title}</span>
            ) : (
              <span className="cell-label muted">Empty</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
