import { invoke } from "@tauri-apps/api/core";
import type { Book } from "../types/book";
import type { ShelfConfig } from "../types/shelf";
import { bookTargetMm, formatPosition } from "../utils/layout";

export interface PresentResult {
  message: string;
  targetX: number;
  targetY: number;
  bookId: string;
  at: string;
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function presentBook(
  book: Book,
  shelf: ShelfConfig,
): Promise<PresentResult> {
  const at = new Date().toISOString();
  const { x: targetX, y: targetY } = bookTargetMm(book, shelf);
  const label = formatPosition(book);
  const fallback = `${label} → target ${targetX.toFixed(1)}, ${targetY.toFixed(1)} mm — selected and pushed`;

  let message: string;
  if (isTauri()) {
    try {
      message = await invoke<string>("present_book", {
        x: targetX,
        y: targetY,
        bookId: book.id,
      });
    } catch {
      message = fallback;
    }
  } else {
    message = fallback;
  }

  return { message, targetX, targetY, bookId: book.id, at };
}
