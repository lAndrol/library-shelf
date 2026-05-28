import { loadData, saveData, type PersistedData } from "../db/storage";
import type { Book, BookInput } from "../types/book";
import { defaultShelfConfig, getCellType } from "./shelf";
import { GRID_COLS, GRID_ROWS, isInGrid } from "../types/shelf";

function read(): PersistedData {
  const data = loadData();
  if (!data) {
    return { version: 1, books: [], shelf: defaultShelfConfig() };
  }
  return data;
}

function write(data: PersistedData): void {
  saveData(data);
}

function now(): string {
  return new Date().toISOString();
}

export function listBooks(): Book[] {
  return read().books;
}

export function getBookAt(x: number, y: number): Book | undefined {
  return read().books.find((b) => b.gridX === x && b.gridY === y);
}

export function getBookById(id: string): Book | undefined {
  return read().books.find((b) => b.id === id);
}

export function createBook(input: BookInput): Book {
  if (!isInGrid(input.gridX, input.gridY, GRID_COLS, GRID_ROWS)) {
    throw new Error("Position is outside the shelf grid.");
  }
  if (getCellType(input.gridX, input.gridY) !== "book-slot") {
    throw new Error("This cell is not a book slot.");
  }
  if (getBookAt(input.gridX, input.gridY)) {
    throw new Error("Another book is already in this cell.");
  }

  const book: Book = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    author: input.author.trim(),
    isbn: input.isbn.trim(),
    notes: input.notes.trim(),
    gridX: input.gridX,
    gridY: input.gridY,
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
  const gridX = input.gridX ?? existing.gridX;
  const gridY = input.gridY ?? existing.gridY;

  if (!isInGrid(gridX, gridY, GRID_COLS, GRID_ROWS)) {
    throw new Error("Position is outside the shelf grid.");
  }
  if (getCellType(gridX, gridY) !== "book-slot") {
    throw new Error("This cell is not a book slot.");
  }
  const occupant = data.books.find(
    (b) => b.gridX === gridX && b.gridY === gridY && b.id !== id,
  );
  if (occupant) throw new Error("Another book is already in this cell.");

  const updated: Book = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    author: input.author !== undefined ? input.author.trim() : existing.author,
    isbn: input.isbn !== undefined ? input.isbn.trim() : existing.isbn,
    notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
    gridX,
    gridY,
    updatedAt: now(),
  };

  if (!updated.title) throw new Error("Title is required.");

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
