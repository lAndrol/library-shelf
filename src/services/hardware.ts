import { invoke } from "@tauri-apps/api/core";

export interface PresentResult {
  message: string;
  x: number;
  y: number;
  at: string;
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Mock hardware: reports that this grid coordinate was selected and pushed. */
export async function presentBook(x: number, y: number): Promise<PresentResult> {
  const at = new Date().toISOString();
  let message: string;

  if (isTauri()) {
    try {
      message = await invoke<string>("present_book", { x, y });
    } catch {
      message = `Coordinate (${x}, ${y}) selected and pushed`;
    }
  } else {
    message = `Coordinate (${x}, ${y}) selected and pushed`;
  }

  return { message, x, y, at };
}
