import { loadData, saveData, type PersistedData } from "../db/storage";
import type { Book } from "../types/book";
import {
  cellKey,
  createDefaultShelfConfig,
  type CellType,
  type CubbyDimensions,
  type ShelfConfig,
} from "../types/shelf";
import { booksFitInCubby, getCubbyDimensions } from "../utils/cubby";

export function defaultShelfConfig() {
  return createDefaultShelfConfig();
}

function read(): PersistedData {
  const data = loadData() ?? { version: 2, books: [], shelf: defaultShelfConfig() };
  if (!data.shelf.cubbyOverrides) {
    data.shelf.cubbyOverrides = {};
  }
  return data;
}

function write(data: PersistedData): void {
  saveData(data);
}

export function getShelfConfig(): ShelfConfig {
  return read().shelf;
}

export function getCellType(x: number, y: number): CellType {
  const key = cellKey(x, y);
  return read().shelf.cellTypes[key] ?? "book-slot";
}

export function setCellType(x: number, y: number, type: CellType): void {
  const data = read();
  data.shelf.cellTypes[cellKey(x, y)] = type;
  write(data);
}

export function cycleCellType(x: number, y: number): CellType {
  const current = getCellType(x, y);
  const next: CellType = current === "book-slot" ? "other" : "book-slot";
  setCellType(x, y, next);
  return next;
}

function validateDimensions(d: CubbyDimensions): void {
  if (d.widthMm <= 0 || d.heightMm <= 0 || d.depthMm <= 0) {
    throw new Error("Cubby dimensions must be greater than 0 mm.");
  }
}

function booksInCubby(data: PersistedData, cubbyX: number, cubbyY: number): Book[] {
  return data.books.filter((b) => b.cubbyX === cubbyX && b.cubbyY === cubbyY);
}

function assertBooksFitCubby(
  data: PersistedData,
  cubbyX: number,
  cubbyY: number,
  dims: CubbyDimensions,
): void {
  const tooBig = booksFitInCubby(booksInCubby(data, cubbyX, cubbyY), dims);
  if (tooBig.length > 0) {
    throw new Error(
      `Cubby too small for: ${tooBig.map((b) => b.title).join(", ")}. Move or resize books first.`,
    );
  }
}

/** Default size for all cubbies without an override. */
export function setDefaultCubbyDimensions(dims: CubbyDimensions): void {
  validateDimensions(dims);
  const data = read();
  const shelf = data.shelf;

  for (let y = 0; y < shelf.rows; y++) {
    for (let x = 0; x < shelf.cols; x++) {
      if (!(cellKey(x, y) in shelf.cubbyOverrides)) {
        assertBooksFitCubby(data, x, y, dims);
      }
    }
  }

  shelf.cubbyWidthMm = dims.widthMm;
  shelf.cubbyHeightMm = dims.heightMm;
  shelf.cubbyDepthMm = dims.depthMm;
  write(data);
}

/** Size for one cubby only. */
export function setCubbyDimensions(
  cubbyX: number,
  cubbyY: number,
  dims: CubbyDimensions,
): void {
  validateDimensions(dims);
  const data = read();
  assertBooksFitCubby(data, cubbyX, cubbyY, dims);
  data.shelf.cubbyOverrides[cellKey(cubbyX, cubbyY)] = { ...dims };
  write(data);
}

export function clearCubbyDimensionsOverride(cubbyX: number, cubbyY: number): void {
  const data = read();
  const shelf = data.shelf;
  const key = cellKey(cubbyX, cubbyY);
  delete shelf.cubbyOverrides[key];
  const defaultDims = getCubbyDimensions(shelf, cubbyX, cubbyY);
  assertBooksFitCubby(data, cubbyX, cubbyY, defaultDims);
  write(data);
}

export { getCubbyDimensions, hasCubbyOverride } from "../utils/cubby";
