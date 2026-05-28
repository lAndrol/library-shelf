import { loadData, saveData, type PersistedData } from "../db/storage";
import {
  cellKey,
  createDefaultShelfConfig,
  type CellType,
  type ShelfConfig,
} from "../types/shelf";

export function defaultShelfConfig() {
  return createDefaultShelfConfig();
}

function read(): PersistedData {
  return loadData() ?? { version: 2, books: [], shelf: defaultShelfConfig() };
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
