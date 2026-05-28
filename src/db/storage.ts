import type { Book, LegacyBookV1 } from "../types/book";
import { DEFAULT_BOOK_SIZE } from "../types/book";
import {
  createDefaultShelfConfig,
  DEFAULT_CUBBY,
  type ShelfConfig,
} from "../types/shelf";

const STORAGE_KEY = "library-shelf-data";

export interface PersistedData {
  version: 2;
  books: Book[];
  shelf: ShelfConfig;
}

type RawPersisted = {
  version?: number;
  books?: unknown[];
  shelf?: ShelfConfig;
};

function migrateBook(raw: unknown): Book {
  const b = raw as Book & LegacyBookV1;
  if (typeof b.cubbyX === "number") {
    return b as Book;
  }
  return {
    id: b.id,
    title: b.title ?? "",
    author: b.author ?? "",
    isbn: b.isbn ?? "",
    notes: b.notes ?? "",
    cubbyX: b.gridX ?? 0,
    cubbyY: b.gridY ?? 0,
    posX: 0,
    posY: 0,
    posZ: 0,
    widthMm: DEFAULT_BOOK_SIZE.widthMm,
    heightMm: DEFAULT_BOOK_SIZE.heightMm,
    depthMm: DEFAULT_BOOK_SIZE.depthMm,
    createdAt: b.createdAt ?? new Date().toISOString(),
    updatedAt: b.updatedAt ?? new Date().toISOString(),
  };
}

function normalize(raw: RawPersisted | null): PersistedData {
  if (!raw) {
    return { version: 2, books: [], shelf: createDefaultShelfConfig() };
  }
  const shelf = {
    ...createDefaultShelfConfig(),
    ...raw.shelf,
    cols: raw.shelf?.cols ?? 5,
    rows: raw.shelf?.rows ?? 5,
    cubbyWidthMm: raw.shelf?.cubbyWidthMm ?? DEFAULT_CUBBY.widthMm,
    cubbyHeightMm: raw.shelf?.cubbyHeightMm ?? DEFAULT_CUBBY.heightMm,
    cubbyDepthMm: raw.shelf?.cubbyDepthMm ?? DEFAULT_CUBBY.depthMm,
    cubbyOverrides: raw.shelf?.cubbyOverrides ?? {},
  };
  const books = (raw.books ?? []).map(migrateBook);
  return { version: 2, books, shelf };
}

export function loadData(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw) as RawPersisted);
  } catch {
    return null;
  }
}

export function saveData(data: PersistedData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: 2 }));
}
