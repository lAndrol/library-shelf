import { useCallback, useMemo, useState } from "react";
import "./App.css";
import { ActionLog } from "./components/ActionLog";
import { BookDetail } from "./components/BookDetail";
import { BookForm } from "./components/BookForm";
import { BookList } from "./components/BookList";
import { CubbyPanel } from "./components/CubbyPanel";
import { ShelfGrid } from "./components/ShelfGrid";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooksInCubby,
  listBooks,
  searchBooks,
  suggestPosition,
  updateBook,
} from "./services/books";
import { presentBook, type PresentResult } from "./services/hardware";
import { cycleCellType, getCellType, getShelfConfig } from "./services/shelf";
import type { Book, BookInput } from "./types/book";
import { DEFAULT_BOOK_SIZE } from "./types/book";

type View = "shelf" | "books";
type PanelMode = "detail" | "add" | "edit";

function App() {
  const [view, setView] = useState<View>("shelf");
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const [selectedCubby, setSelectedCubby] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
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

  const selectedBook = selectedBookId
    ? getBookById(selectedBookId)
    : undefined;
  const cubbyBooks =
    selectedCubby !== null
      ? getBooksInCubby(selectedCubby.x, selectedCubby.y)
      : [];
  const selectedCellType =
    selectedCubby !== null
      ? getCellType(selectedCubby.x, selectedCubby.y)
      : "book-slot";

  function selectCubby(x: number, y: number) {
    setSelectedCubby({ x, y });
    setSelectedBookId(null);
    setPanelMode("detail");
    setStatus(null);
    setView("shelf");
  }

  function selectBook(book: Book) {
    setSelectedCubby({ x: book.cubbyX, y: book.cubbyY });
    setSelectedBookId(book.id);
    setPanelMode("detail");
    setStatus(null);
    setView("shelf");
  }

  function selectBookFromList(book: Book) {
    selectBook(book);
  }

  function startAddBook() {
    if (!selectedCubby) return;
    setPanelMode("add");
  }

  async function handlePresent() {
    if (!selectedBook) return;
    setPresenting(true);
    setStatus(null);
    try {
      const result = await presentBook(selectedBook, shelf);
      setLog((prev) => [result, ...prev].slice(0, 50));
      setStatus(result.message);
    } finally {
      setPresenting(false);
    }
  }

  function handleSaveBook(input: BookInput) {
    if (panelMode === "edit" && selectedBook) {
      updateBook(selectedBook.id, input);
      setSelectedBookId(selectedBook.id);
    } else {
      const created = createBook(input);
      setSelectedBookId(created.id);
      setSelectedCubby({ x: created.cubbyX, y: created.cubbyY });
    }
    setPanelMode("detail");
    refresh();
  }

  function handleDeleteBook() {
    if (!selectedBook) return;
    deleteBook(selectedBook.id);
    setSelectedBookId(null);
    setPanelMode("detail");
    refresh();
  }

  function handleToggleCellType() {
    if (!selectedCubby) return;
    cycleCellType(selectedCubby.x, selectedCubby.y);
    refresh();
  }

  function addFormInitial(): Partial<BookInput> {
    if (!selectedCubby) {
      return { ...DEFAULT_BOOK_SIZE };
    }
    const pos = suggestPosition(selectedCubby.x, selectedCubby.y);
    return {
      cubbyX: selectedCubby.x,
      cubbyY: selectedCubby.y,
      ...pos,
      ...DEFAULT_BOOK_SIZE,
    };
  }

  const sidebar = (
    <>
      {selectedCubby === null ? (
        <section className="panel cell-detail">
          <h2>Select a cubby or book</h2>
          <p className="muted">
            Click a cubby background, or click a book block to select it precisely.
          </p>
        </section>
      ) : panelMode === "add" ? (
        <BookForm
          shelf={shelf}
          initial={addFormInitial()}
          onSave={handleSaveBook}
          onCancel={() => setPanelMode("detail")}
        />
      ) : panelMode === "edit" && selectedBook ? (
        <BookForm
          shelf={shelf}
          initial={{ ...selectedBook, id: selectedBook.id }}
          onSave={handleSaveBook}
          onCancel={() => setPanelMode("detail")}
          onDelete={handleDeleteBook}
        />
      ) : selectedBook ? (
        <BookDetail
          book={selectedBook}
          shelf={shelf}
          onPresent={handlePresent}
          onEdit={() => setPanelMode("edit")}
          presenting={presenting}
        />
      ) : (
        <CubbyPanel
          cubbyX={selectedCubby.x}
          cubbyY={selectedCubby.y}
          cellType={selectedCellType}
          books={cubbyBooks}
          selectedBookId={selectedBookId}
          onSelectBook={selectBook}
          onAddBook={startAddBook}
          onToggleCellType={handleToggleCellType}
        />
      )}
      <ActionLog entries={log} />
    </>
  );

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Library Shelf</h1>
          <p className="subtitle">
            5×5 cubbies · many books per cubby · mm positions · click each book
          </p>
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
                shelf={shelf}
                cellTypes={shelf.cellTypes}
                selectedCubby={selectedCubby}
                selectedBookId={selectedBookId}
                onSelectCubby={selectCubby}
                onSelectBook={selectBook}
              />
            </div>
            <aside className="sidebar">{sidebar}</aside>
          </div>
        ) : (
          <div className="books-layout">
            <BookList
              books={filteredBooks}
              query={searchQuery}
              onQueryChange={setSearchQuery}
              selectedId={selectedBookId}
              onSelect={selectBookFromList}
            />
            <aside className="sidebar">{sidebar}</aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
