import { loadData, saveData, type PersistedData } from "../db/storage";
import type { Book, BookInput } from "../types/book";
import { DEFAULT_BOOK_SIZE } from "../types/book";
import { formatCubbyDimensions, getCubbyDimensions } from "../utils/cubby";
import { bookFitsCubbyDims, findOverlaps } from "../utils/layout";
import { defaultShelfConfig, getCellType, getShelfConfig } from "./shelf";
import { GRID_COLS, GRID_ROWS, isInGrid } from "../types/shelf";

function read(): PersistedData {
  return loadData() ?? { version: 2, books: [], shelf: defaultShelfConfig() };
}

function write(data: PersistedData): void {
  saveData(data);
}

function now(): string {
  return new Date().toISOString();
}

function validateBook(input: BookInput, excludeId?: string): void {
  const shelf = getShelfConfig();
  if (!isInGrid(input.cubbyX, input.cubbyY, GRID_COLS, GRID_ROWS)) {
    throw new Error("Cubby is outside the 5×5 grid.");
  }
  if (getCellType(input.cubbyX, input.cubbyY) !== "book-slot") {
    throw new Error("This cubby is not a book slot.");
  }
  if (input.widthMm <= 0 || input.heightMm <= 0 || input.depthMm <= 0) {
    throw new Error("Book dimensions must be greater than 0 mm.");
  }
  const draft = { ...input, id: excludeId ?? "__draft__" } as Book;
  const cubby = getCubbyDimensions(shelf, input.cubbyX, input.cubbyY);
  if (!bookFitsCubbyDims(draft, cubby)) {
    throw new Error(`Book does not fit inside cubby (${formatCubbyDimensions(cubby)}).`);
  }
  const inCubby = getBooksInCubby(input.cubbyX, input.cubbyY).filter(
    (b) => b.id !== excludeId,
  );
  const overlaps = findOverlaps(draft, inCubby);
  if (overlaps.length > 0) {
    throw new Error(
      `Footprint overlaps: ${overlaps.map((b) => b.title).join(", ")}`,
    );
  }
}

export function listBooks(): Book[] {
  return read().books;
}

export function getBooksInCubby(cubbyX: number, cubbyY: number): Book[] {
  return read().books.filter((b) => b.cubbyX === cubbyX && b.cubbyY === cubbyY);
}

export function getBookById(id: string): Book | undefined {
  return read().books.find((b) => b.id === id);
}

export function createBook(input: BookInput): Book {
  if (!input.title.trim()) throw new Error("Title is required.");
  validateBook(input);

  const book: Book = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    author: input.author.trim(),
    isbn: input.isbn.trim(),
    notes: input.notes.trim(),
    cubbyX: input.cubbyX,
    cubbyY: input.cubbyY,
    posX: input.posX,
    posY: input.posY,
    posZ: input.posZ,
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    depthMm: input.depthMm,
    createdAt: now(),
    updatedAt: now(),
  };

  const data = read();
  data.books.push(book);
  write(data);
  return book;
}

export function updateBook(id: string, input: Partial<BookInput>): Book {
  const data = read();
  const index = data.books.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("Book not found.");

  const existing = data.books[index];
  const merged: BookInput = {
    title: input.title ?? existing.title,
    author: input.author ?? existing.author,
    isbn: input.isbn ?? existing.isbn,
    notes: input.notes ?? existing.notes,
    cubbyX: input.cubbyX ?? existing.cubbyX,
    cubbyY: input.cubbyY ?? existing.cubbyY,
    posX: input.posX ?? existing.posX,
    posY: input.posY ?? existing.posY,
    posZ: input.posZ ?? existing.posZ,
    widthMm: input.widthMm ?? existing.widthMm,
    heightMm: input.heightMm ?? existing.heightMm,
    depthMm: input.depthMm ?? existing.depthMm,
  };

  if (!merged.title.trim()) throw new Error("Title is required.");
  validateBook(merged, id);

  const updated: Book = { ...existing, ...merged, updatedAt: now() };
  data.books[index] = updated;
  write(data);
  return updated;
}

export function deleteBook(id: string): void {
  const data = read();
  data.books = data.books.filter((b) => b.id !== id);
  write(data);
}

export function searchBooks(query: string): Book[] {
  const q = query.trim().toLowerCase();
  if (!q) return listBooks();
  return listBooks().filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q),
  );
}

/** Suggest next free-ish position in cubby (simple stack to the right). */
export function suggestPosition(cubbyX: number, cubbyY: number): {
  posX: number;
  posY: number;
  posZ: number;
} {
  const shelf = getShelfConfig();
  const existing = getBooksInCubby(cubbyX, cubbyY);
  if (existing.length === 0) return { posX: 0, posY: 0, posZ: 0 };

  let maxRight = 0;
  for (const b of existing) {
    maxRight = Math.max(maxRight, b.posX + b.widthMm);
  }
  const gap = 4;
  const cubby = getCubbyDimensions(shelf, cubbyX, cubbyY);
  const posX = Math.min(maxRight + gap, cubby.widthMm - DEFAULT_BOOK_SIZE.widthMm);
  return { posX: Math.max(0, posX), posY: 0, posZ: 0 };
}
