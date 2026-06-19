import { useMemo, useState } from "react";
import { parseGoodreadsCsv } from "../domain/goodreadsCsv";
import { addBook, booksByShelf, upsertBook } from "../domain/library";
import type { Book, LinkSourceSetting, Shelf } from "../domain/types";
import BookForm from "./BookForm";

interface LibraryViewProps {
  books: Book[];
  linkSources: LinkSourceSetting[];
  onBooksChange: (books: Book[]) => void;
  onSelectBook: (bookId: string) => void;
}

export default function LibraryView({ books, linkSources, onBooksChange, onSelectBook }: LibraryViewProps) {
  const [query, setQuery] = useState("");
  const [shelf, setShelf] = useState<Shelf | "all">("all");
  const [importMessage, setImportMessage] = useState("");

  const visibleBooks = useMemo(() => {
    return books
      .filter((book) => shelf === "all" || book.shelf === shelf)
      .filter((book) =>
        `${book.title} ${book.author} ${book.userNotes}`.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, query, shelf]);

  async function importFile(file: File) {
    const csv = await file.text();
    const summary = parseGoodreadsCsv(csv, { linkSources });
    const merged = summary.imported.reduce((current, book) => upsertBook(current, book), books);
    onBooksChange(merged);
    setImportMessage(`Imported ${summary.imported.length} books. Skipped ${summary.skipped.length}.`);
  }

  const inputClass =
    "w-full rounded-xl bg-[--color-input-bg] shadow-sm text-[--color-ink] placeholder:text-[--color-ink-light] px-3 py-2 text-sm focus:outline-none transition-colors";

  const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-[--color-amber] mb-1.5";

  return (
    <div className="px-7 py-6 space-y-7">
      {/* Import */}
      <section>
        <p className={labelClass}>Import Goodreads CSV</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-sm px-4 py-2 rounded-full text-[--color-ink-muted] bg-[--color-ghost-btn] hover:text-[--color-ink] transition-colors whitespace-nowrap cursor-pointer">
            Choose file
          </span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
            }}
          />
          <span className="text-sm text-[--color-ink-muted]">
            {importMessage || "No file chosen"}
          </span>
        </label>
      </section>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[260px_1fr]">
        {/* Add book form */}
        <section>
          <p className={labelClass}>Add a book</p>
          <BookForm
            linkSources={linkSources}
            submitLabel="Add book"
            onSubmit={(book) => onBooksChange(addBook(books, book))}
          />
        </section>

        {/* Browse */}
        <section className="min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className={labelClass + " mb-0"}>Your library</p>
            <span className="text-xs text-[--color-ink-light]">
              {visibleBooks.length} {visibleBooks.length === 1 ? "book" : "books"}
            </span>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label htmlFor="library-search" className="sr-only">Search</label>
              <input
                id="library-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, author, or notes…"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="library-shelf" className="sr-only">Filter shelf</label>
              <select
                id="library-shelf"
                value={shelf}
                onChange={(e) => setShelf(e.target.value as Shelf | "all")}
                className={inputClass + " pr-8"}
              >
                <option value="all">All shelves</option>
                <option value="read">Read ({booksByShelf(books, "read").length})</option>
                <option value="want-to-read">Want to read ({booksByShelf(books, "want-to-read").length})</option>
                <option value="none">No shelf</option>
              </select>
            </div>
          </div>

          {visibleBooks.length === 0 ? (
            <p className="text-sm text-[--color-ink-muted] py-4">
              {books.length === 0
                ? "Import a Goodreads CSV or add a book manually to get started."
                : "No books match your current filter."}
            </p>
          ) : (
            <div className="space-y-1">
              {visibleBooks.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => onSelectBook(book.id)}
                  className="w-full text-left flex items-center justify-between gap-4 px-3.5 py-2.5 rounded-xl hover:bg-[--color-cream] transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[--color-ink] truncate m-0 group-hover:text-[--color-espresso]">
                      {book.title}
                    </p>
                    <p className="text-xs text-[--color-ink-muted] truncate m-0">{book.author}</p>
                  </div>
                  <ShelfBadge shelf={book.shelf} />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ShelfBadge({ shelf }: { shelf: string }) {
  if (shelf === "read") {
    return (
      <span className="shrink-0 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-[--color-green] bg-[--color-green-bg]">
        Read
      </span>
    );
  }
  if (shelf === "want-to-read") {
    return (
      <span className="shrink-0 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-[--color-amber] bg-[--color-amber-bg]">
        Want to read
      </span>
    );
  }
  return null;
}
