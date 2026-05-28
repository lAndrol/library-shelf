import type { Book } from "../types/book";
import type { CubbyDimensions, ShelfConfig } from "../types/shelf";
import { cubbyOriginMm, getCubbyDimensions } from "./cubby";

export interface RectMm {
  x: number;
  y: number;
  w: number;
  h: number;
}

function groundedTopMm(book: Book, cubby: CubbyDimensions): number {
  return Math.max(0, cubby.heightMm - book.heightMm);
}

export function bookFootprint(book: Book): RectMm {
  // Books always sit on the cubby floor; no vertical position input.
  return { x: book.posX, y: 0, w: book.widthMm, h: book.heightMm };
}

export function rectsOverlap(a: RectMm, b: RectMm): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function findOverlaps(book: Book, others: Book[]): Book[] {
  const a = bookFootprint(book);
  return others.filter((o) => o.id !== book.id && rectsOverlap(a, bookFootprint(o)));
}

export function bookFitsCubby(book: Book, shelf: ShelfConfig): boolean {
  const cubby = getCubbyDimensions(shelf, book.cubbyX, book.cubbyY);
  return bookFitsCubbyDims(book, cubby);
}

export function bookFitsCubbyDims(book: Book, cubby: CubbyDimensions): boolean {
  return (
    book.posX >= 0 &&
    book.posX + book.widthMm <= cubby.widthMm &&
    book.heightMm <= cubby.heightMm &&
    book.posZ >= 0 &&
    book.posZ + book.depthMm <= cubby.depthMm
  );
}

/** Global target on the XY plane behind the shelf (mm), book center. */
export function bookTargetMm(book: Book, shelf: ShelfConfig): { x: number; y: number } {
  const origin = cubbyOriginMm(shelf, book.cubbyX, book.cubbyY);
  const cubby = getCubbyDimensions(shelf, book.cubbyX, book.cubbyY);
  const top = groundedTopMm(book, cubby);
  return {
    x: origin.x + book.posX + book.widthMm / 2,
    y: origin.y + top + book.heightMm / 2,
  };
}

/** CSS % for rendering a book inside a cubby (front view). */
export function bookStylePercent(
  book: Book,
  cubby: CubbyDimensions,
): {
  left: string;
  top: string;
  width: string;
  height: string;
  zIndex: number;
} {
  const top = groundedTopMm(book, cubby);
  return {
    left: `${(book.posX / cubby.widthMm) * 100}%`,
    top: `${(top / cubby.heightMm) * 100}%`,
    width: `${(book.widthMm / cubby.widthMm) * 100}%`,
    height: `${(book.heightMm / cubby.heightMm) * 100}%`,
    zIndex: 10 + Math.round(book.posZ),
  };
}

export function formatPosition(book: Book): string {
  if (!book.placed) return "not on shelf";
  return `cubby (${book.cubbyX},${book.cubbyY}) · x:${book.posX}, z:${book.posZ} mm`;
}

export function formatSize(book: Book): string {
  return `${book.widthMm}×${book.heightMm}×${book.depthMm} mm`;
}
