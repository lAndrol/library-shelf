import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { ActionLog } from "./components/ActionLog";
import { BookDetail } from "./components/BookDetail";
import { BookForm } from "./components/BookForm";
import { BookList } from "./components/BookList";
import { CubbyPanel } from "./components/CubbyPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { ShelfGrid } from "./components/ShelfGrid";
import {
  createInventoryBook,
  createBook,
  deleteBook,
  getBookById,
  getBooksInCubby,
  listPlacedBooks,
  listBooks,
  listUnplacedBooks,
  placeUnplacedBooksInCubby,
  suggestPosition,
  updateBook,
} from "./services/books";
import { presentBook, type PresentResult } from "./services/hardware";
import {
  cycleCellType,
  getCellType,
  getShelfConfig,
  setDefaultCubbyDimensions,
} from "./services/shelf";
import type { CubbyDimensions } from "./types/shelf";
import type { Book, BookInput } from "./types/book";
import { DEFAULT_BOOK_SIZE } from "./types/book";

type View = "shelf" | "books" | "settings";
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
  const [typeQuery, setTypeQuery] = useState("");
  const [showTypeQuery, setShowTypeQuery] = useState(false);
  const [log, setLog] = useState<PresentResult[]>([]);
  const [presenting, setPresenting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const hideQueryTimerRef = useRef<number | null>(null);

  const shelf = useMemo(() => getShelfConfig(), [tick]);
  const books = useMemo(() => listBooks(), [tick]);
  const placedBooks = useMemo(() => listPlacedBooks(), [tick]);
  const unplacedBooks = useMemo(() => listUnplacedBooks(), [tick]);

  const normalizedQuery = typeQuery.trim().toLowerCase();
  const highlightedBookIds = useMemo(() => {
    if (!normalizedQuery) return new Set<string>();
    return new Set(
      books
        .filter((b) => {
          const title = b.title.toLowerCase();
          const author = b.author.toLowerCase();
          return title.includes(normalizedQuery) || author.includes(normalizedQuery);
        })
        .map((b) => b.id),
    );
  }, [books, normalizedQuery]);

  const booksForList = useMemo(() => {
    if (!normalizedQuery) return books;
    const matched = books.filter((b) => highlightedBookIds.has(b.id));
    const unmatched = books.filter((b) => !highlightedBookIds.has(b.id));
    return [...matched, ...unmatched];
  }, [books, highlightedBookIds, normalizedQuery]);

  useEffect(() => {
    if (!showTypeQuery) return;
    if (hideQueryTimerRef.current) {
      window.clearTimeout(hideQueryTimerRef.current);
    }
    hideQueryTimerRef.current = window.setTimeout(() => {
      setShowTypeQuery(false);
    }, 1000);
    return () => {
      if (hideQueryTimerRef.current) {
        window.clearTimeout(hideQueryTimerRef.current);
      }
    };
  }, [showTypeQuery, typeQuery]);

  useEffect(() => {
    function isEditableTarget(target: EventTarget | null): boolean {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return (
        el.isContentEditable ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select"
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Escape") {
        setTypeQuery("");
        setShowTypeQuery(false);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setTypeQuery((prev) => prev.slice(0, -1));
        setShowTypeQuery(true);
        return;
      }

      if (e.key.length === 1 && !e.repeat) {
        e.preventDefault();
        setTypeQuery((prev) => (prev + e.key).slice(0, 40));
        setShowTypeQuery(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
    if (!book.placed) {
      setSelectedCubby(null);
      setSelectedBookId(book.id);
      setPanelMode("detail");
      setStatus(null);
      setView("books");
      return;
    }
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

  function handleSaveDefaultCubby(dims: CubbyDimensions) {
    setDefaultCubbyDimensions(dims);
    setStatus(`Default cubby size set to ${dims.widthMm}×${dims.heightMm}×${dims.depthMm} mm`);
    refresh();
  }

  function handleAddInventoryBook(input: {
    title: string;
    author: string;
    isbn: string;
    notes: string;
    widthMm: number;
    heightMm: number;
    depthMm: number;
  }) {
    const created = createInventoryBook(input);
    setSelectedBookId(created.id);
    setStatus("Book added to inventory.");
    refresh();
  }

  function handlePlaceQueuedInSelectedCubby(orderedIds: string[]) {
    if (!selectedCubby) return { placedCount: 0, skippedIds: [] as string[] };
    const result = placeUnplacedBooksInCubby(
      selectedCubby.x,
      selectedCubby.y,
      orderedIds,
    );
    if (result.placed.length > 0) {
      setSelectedBookId(result.placed[0].id);
    }
    setStatus(
      `Placed ${result.placed.length} book(s), skipped ${result.skipped.length} in cubby (${selectedCubby.x},${selectedCubby.y}).`,
    );
    refresh();
    return {
      placedCount: result.placed.length,
      skippedIds: result.skipped.map((s) => s.id),
    };
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
          shelf={shelf}
          cellType={selectedCellType}
          books={cubbyBooks}
          unplacedBooks={unplacedBooks}
          selectedBookId={selectedBookId}
          onSelectBook={selectBook}
          onAddBook={startAddBook}
          onToggleCellType={handleToggleCellType}
          onPlaceQueued={handlePlaceQueuedInSelectedCubby}
        />
      )}
      <ActionLog entries={log} />
    </>
  );

  return (
    <div className={`app ${normalizedQuery ? "search-active" : ""}`}>
      <header className="app-header">
        <div>
          <h1>Library Shelf</h1>
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
          <button
            type="button"
            className={view === "settings" ? "active" : ""}
            onClick={() => {
              setView("settings");
              setStatus(null);
            }}
          >
            Settings
          </button>
        </nav>
      </header>

      {status && <div className="status-banner">{status}</div>}
      {showTypeQuery && typeQuery && (
        <div className="type-search-overlay">
          Search: <span>{typeQuery}</span>
        </div>
      )}

      <main className="app-main">
        {view === "settings" ? (
          <div className="settings-layout">
            <SettingsPanel shelf={shelf} onSaveDefault={handleSaveDefaultCubby} />
            <aside className="sidebar">
              <ActionLog entries={log} />
            </aside>
          </div>
        ) : view === "shelf" ? (
          <div className="shelf-layout">
            <div className="shelf-frame">
              <ShelfGrid
                books={placedBooks}
                shelf={shelf}
                cellTypes={shelf.cellTypes}
                selectedCubby={selectedCubby}
                selectedBookId={selectedBookId}
                highlightedBookIds={highlightedBookIds}
                onSelectCubby={selectCubby}
                onSelectBook={selectBook}
              />
            </div>
            <aside className="sidebar">{sidebar}</aside>
          </div>
        ) : (
          <div className="books-layout">
            <BookList
              books={booksForList}
              selectedId={selectedBookId}
              highlightedBookIds={highlightedBookIds}
              typedQuery={typeQuery}
              onSelect={selectBookFromList}
              onAddInventory={handleAddInventoryBook}
            />
            <aside className="sidebar">{sidebar}</aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
