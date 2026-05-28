const STORAGE_KEY = "library-shelf-data";

export interface PersistedData {
  version: 1;
  books: import("../types/book").Book[];
  shelf: import("../types/shelf").ShelfConfig;
}

export function loadData(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedData;
  } catch {
    return null;
  }
}

export function saveData(data: PersistedData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
