export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  notes: string;
  gridX: number;
  gridY: number;
  createdAt: string;
  updatedAt: string;
}

export type BookInput = Pick<
  Book,
  "title" | "author" | "isbn" | "notes" | "gridX" | "gridY"
>;
