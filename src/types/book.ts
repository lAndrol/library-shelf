/** Physical size in millimeters (front view: width × height; depth into cubby). */
export interface BookDimensions {
  widthMm: number;
  heightMm: number;
  depthMm: number;
}

export interface Book extends BookDimensions {
  id: string;
  title: string;
  author: string;
  isbn: string;
  notes: string;
  /** Cubby column 0–4 (coarse grid). */
  cubbyX: number;
  /** Cubby row 0–4 (coarse grid). */
  cubbyY: number;
  /** Position inside cubby from top-left, mm. */
  posX: number;
  posY: number;
  /** Distance from back of cubby, mm (stacking / click order). */
  posZ: number;
  createdAt: string;
  updatedAt: string;
}

export type BookInput = Pick<
  Book,
  | "title"
  | "author"
  | "isbn"
  | "notes"
  | "cubbyX"
  | "cubbyY"
  | "posX"
  | "posY"
  | "posZ"
  | "widthMm"
  | "heightMm"
  | "depthMm"
>;

export const DEFAULT_BOOK_SIZE = {
  widthMm: 110,
  heightMm: 180,
  depthMm: 22,
} as const;

/** @deprecated v1 field names — used only for migration */
export interface LegacyBookV1 {
  id: string;
  title: string;
  author: string;
  isbn: string;
  notes: string;
  gridX: number;
  gridY: number;
  createdAt: string;
  updatedAt: string;
}
