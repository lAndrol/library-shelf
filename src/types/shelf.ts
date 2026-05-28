export const GRID_COLS = 5;
export const GRID_ROWS = 5;

/** Default inner cubby size (mm) — front opening width × height. */
export const DEFAULT_CUBBY = {
  widthMm: 180,
  heightMm: 220,
  depthMm: 280,
} as const;

export type BookSlotCell = "book-slot";
export type OtherCell = "other";
export type CellType = BookSlotCell | OtherCell;

export interface ShelfConfig {
  cols: number;
  rows: number;
  cubbyWidthMm: number;
  cubbyHeightMm: number;
  cubbyDepthMm: number;
  cellTypes: Record<string, CellType>;
}

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function isInGrid(x: number, y: number, cols: number, rows: number): boolean {
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

export function createDefaultShelfConfig(): ShelfConfig {
  const cellTypes: Record<string, CellType> = {};
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      cellTypes[cellKey(x, y)] = "book-slot";
    }
  }
  return {
    cols: GRID_COLS,
    rows: GRID_ROWS,
    cubbyWidthMm: DEFAULT_CUBBY.widthMm,
    cubbyHeightMm: DEFAULT_CUBBY.heightMm,
    cubbyDepthMm: DEFAULT_CUBBY.depthMm,
    cellTypes,
  };
}
