import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { ActionLog } from "./components/ActionLog";
import { BookForm } from "./components/BookForm";
import { BookList } from "./components/BookList";
import { CellDetail } from "./components/CellDetail";
import { ShelfGrid } from "./components/ShelfGrid";
import {
  createBook,
  deleteBook,
  getBookAt,
  listBooks,
  searchBooks,
  updateBook,
} from "./services/books";
import { presentBook, type PresentResult } from "./services/hardware";
import { cycleCellType, getCellType, getShelfConfig } from "./services/shelf";
import type { Book, BookInput } from "./types/book";

type View = "shelf" | "books";
type PanelMode = "detail" | "add" | "edit" | null;

function App() {
  const [view, setView] = useState<View>("shelf");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const [selected, setSelected] = useState<{ x: number; y: number } | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [searchQuery, setSearchQuery] = useState("");
  const [log, setLog] = useState<PresentResult[]>([]);
  const [presenting, setPresenting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const shelf = useMemo(() => getShelfConfig(), [tick]);
  const books = useMemo(() => listBooks(), [tick]);
  const filteredBooks = useMemo(
    () => searchBooks(searchQuery),
    [tick, searchQuery],
  );

  const selectedBook =
    selected !== null ? getBookAt(selected.x, selected.y) : undefined;
  const selectedCellType =
    selected !== null ? getCellType(selected.x, selected.y) : "book-slot";

  function selectCell(x: number, y: number) {
    setSelected({ x, y });
    setPanelMode("detail");
    setStatus(null);
    setView("shelf");
  }

  function selectBookFromList(book: Book) {
    selectCell(book.gridX, book.gridY);
  }

  async function handlePresent() {
    if (!selected) return;
    setPresenting(true);
    setStatus(null);
    try {
      const result = await presentBook(selected.x, selected.y);
      setLog((prev) => [result, ...prev].slice(0, 50));
      setStatus(result.message);
    } finally {
      setPresenting(false);
    }
  }

  function handleSaveBook(input: BookInput) {
    if (panelMode === "edit" && selectedBook) {
      updateBook(selectedBook.id, input);
    } else {
      createBook(input);
      setSelected({ x: input.gridX, y: input.gridY });
    }
    setPanelMode("detail");
    refresh();
  }

  function handleDeleteBook() {
    if (!selectedBook) return;
    deleteBook(selectedBook.id);
    setPanelMode("detail");
    refresh();
  }

  function handleToggleCellType() {
    if (!selected) return;
    cycleCellType(selected.x, selected.y);
    refresh();
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Library Shelf</h1>
          <p className="subtitle">5×5 grid · (0,0) top-left · hardware mock</p>
        </div>
        <nav className="view-nav">
          <button
            type="button"
            className={view === "shelf" ? "active" : ""}
            onClick={() => setView("shelf")}
          >
            Shelf
          </button>
          <button
            type="button"
            className={view === "books" ? "active" : ""}
            onClick={() => setView("books")}
          >
            Books
          </button>
        </nav>
      </header>

      {status && <div className="status-banner">{status}</div>}

      <main className="app-main">
        {view === "shelf" ? (
          <div className="shelf-layout">
            <div className="shelf-frame">
              <ShelfGrid
                books={books}
                cellTypes={shelf.cellTypes}
                selected={selected}
                onSelectCell={selectCell}
              />
            </div>
            <aside className="sidebar">
              {selected === null ? (
                <section className="panel cell-detail">
                  <h2>Select a cell</h2>
                  <p className="muted">Click a square on the shelf to view or add a book.</p>
                </section>
              ) : panelMode === "add" || panelMode === "edit" ? (
                <BookForm
                  initial={
                    panelMode === "edit" && selectedBook
                      ? { ...selectedBook, id: selectedBook.id }
                      : { gridX: selected.x, gridY: selected.y }
                  }
                  onSave={handleSaveBook}
                  onCancel={() => setPanelMode("detail")}
                  onDelete={panelMode === "edit" ? handleDeleteBook : undefined}
                />
              ) : (
                <CellDetail
                  x={selected.x}
                  y={selected.y}
                  cellType={selectedCellType}
                  book={selectedBook}
                  onPresent={handlePresent}
                  onAdd={() => setPanelMode("add")}
                  onEdit={() => setPanelMode("edit")}
                  onToggleCellType={handleToggleCellType}
                  presenting={presenting}
                />
              )}
              <ActionLog entries={log} />
            </aside>
          </div>
        ) : (
          <div className="books-layout">
            <BookList
              books={filteredBooks}
              query={searchQuery}
              onQueryChange={setSearchQuery}
              selectedId={selectedBook?.id ?? null}
              onSelect={selectBookFromList}
            />
            {selected !== null && selectedBook && panelMode === "detail" && (
              <CellDetail
                x={selected.x}
                y={selected.y}
                cellType={selectedCellType}
                book={selectedBook}
                onPresent={handlePresent}
                onAdd={() => setPanelMode("add")}
                onEdit={() => setPanelMode("edit")}
                onToggleCellType={handleToggleCellType}
                presenting={presenting}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
