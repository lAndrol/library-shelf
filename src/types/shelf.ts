export const GRID_COLS = 5;
export const GRID_ROWS = 5;

/** Slot that can hold a book */
export type BookSlotCell = "book-slot";

/** Decorative / non-book cubby — no present command */
export type OtherCell = "other";

export type CellType = BookSlotCell | OtherCell;

export interface ShelfConfig {
  cols: number;
  rows: number;
  /** key: "x,y" */
  cellTypes: Record<string, CellType>;
}

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function isInGrid(x: number, y: number, cols: number, rows: number): boolean {
  return x >= 0 && x < cols && y >= 0 && y < rows;
}
