import type { Book } from "../types/book";
import type { CubbyDimensions, ShelfConfig } from "../types/shelf";
import { cellKey } from "../types/shelf";

export function getCubbyDimensions(
  shelf: ShelfConfig,
  cubbyX: number,
  cubbyY: number,
): CubbyDimensions {
  const override = shelf.cubbyOverrides[cellKey(cubbyX, cubbyY)];
  if (override) return override;
  return {
    widthMm: shelf.cubbyWidthMm,
    heightMm: shelf.cubbyHeightMm,
    depthMm: shelf.cubbyDepthMm,
  };
}

export function hasCubbyOverride(
  shelf: ShelfConfig,
  cubbyX: number,
  cubbyY: number,
): boolean {
  return cellKey(cubbyX, cubbyY) in shelf.cubbyOverrides;
}

/** Top-left corner of this cubby on the full shelf plane (mm). */
export function cubbyOriginMm(
  shelf: ShelfConfig,
  cubbyX: number,
  cubbyY: number,
): { x: number; y: number } {
  let x = 0;
  for (let i = 0; i < cubbyX; i++) {
    x += getCubbyDimensions(shelf, i, cubbyY).widthMm;
  }
  let y = 0;
  for (let j = 0; j < cubbyY; j++) {
    y += getCubbyDimensions(shelf, cubbyX, j).heightMm;
  }
  return { x, y };
}

export function formatCubbyDimensions(d: CubbyDimensions): string {
  return `${d.widthMm}×${d.heightMm}×${d.depthMm} mm`;
}

export function booksFitInCubby(
  books: Book[],
  dims: CubbyDimensions,
): Book[] {
  return books.filter(
    (b) =>
      b.posX + b.widthMm > dims.widthMm ||
      b.posY + b.heightMm > dims.heightMm ||
      b.posZ + b.depthMm > dims.depthMm,
  );
}
