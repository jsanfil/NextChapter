import { useMemo, useState } from "react";
import { parseGoodreadsCsv } from "../domain/goodreadsCsv";
import { upsertBook } from "../domain/library";
import type { Book, LinkSourceSetting } from "../domain/types";

interface LibraryViewProps {
  books: Book[];
  linkSources: LinkSourceSetting[];
  onBooksChange: (books: Book[]) => void;
  onSelectBook: (bookId: string) => void;
}

/* ── Shelf filter options ── */
type ShelfFilter = "all" | "read" | "want-to-read" | "none";

interface ShelfOption {
  id: ShelfFilter;
  label: string;
}

const CORE_SHELVES: ShelfOption[] = [
  { id: "all", label: "All" },
  { id: "read", label: "Read" },
  { id: "want-to-read", label: "Want to read" },
];

/* ── Star rating display ── */
function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= rating ? "text-[--color-amber]" : "text-[--color-border-mid]"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

/* ── Shelf badge pill ── */
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

/* ── Format a date string for display ── */
function formatDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  // If it's just a year (4 digits), return as-is
  if (/^\d{4}$/.test(dateStr.trim())) return dateStr.trim();
  // Otherwise try to parse
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function LibraryView({ books, linkSources, onBooksChange, onSelectBook }: LibraryViewProps) {
  const [query, setQuery] = useState("");
  const [shelfFilter, setShelfFilter] = useState<ShelfFilter>("all");
  const [importMessage, setImportMessage] = useState("");

  /* Compute shelf counts */
  const shelfCounts = useMemo(() => ({
    all: books.length,
    read: books.filter((b) => b.shelf === "read").length,
    "want-to-read": books.filter((b) => b.shelf === "want-to-read").length,
    none: books.filter((b) => b.shelf === "none").length,
  }), [books]);

  /* Build shelf options — only show "No shelf" if books exist there */
  const shelfOptions = useMemo<ShelfOption[]>(() => {
    const opts: ShelfOption[] = CORE_SHELVES.filter(
      (s) => s.id === "all" || shelfCounts[s.id] > 0
    );
    if (shelfCounts.none > 0) {
      opts.push({ id: "none", label: "No shelf" });
    }
    return opts;
  }, [shelfCounts]);

  const visibleBooks = useMemo(() => {
    return books
      .filter((book) => shelfFilter === "all" || book.shelf === shelfFilter)
      .filter((book) =>
        `${book.title} ${book.author} ${book.userNotes}`.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        // Sort: by shelf order (read first, then want-to-read, then none), then alpha
        const shelfOrder: Record<string, number> = { read: 0, "want-to-read": 1, none: 2 };
        const shelfDiff = (shelfOrder[a.shelf] ?? 2) - (shelfOrder[b.shelf] ?? 2);
        if (shelfDiff !== 0) return shelfDiff;
        return a.title.localeCompare(b.title);
      });
  }, [books, query, shelfFilter]);

  async function importFile(file: File) {
    const csv = await file.text();
    const summary = parseGoodreadsCsv(csv, { linkSources });
    const merged = summary.imported.reduce((current, book) => upsertBook(current, book), books);
    onBooksChange(merged);
    setImportMessage(
      `Imported ${summary.imported.length} book${summary.imported.length !== 1 ? "s" : ""}` +
        (summary.skipped.length > 0 ? ` · ${summary.skipped.length} skipped` : "")
    );
  }

  const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-[--color-amber] mb-1.5";
  const inputClass =
    "w-full rounded-xl bg-[--color-input-bg] shadow-sm text-[--color-ink] placeholder:text-[--color-ink-light] px-3 py-2 text-sm focus:outline-none transition-colors";

  return (
    <div className="flex flex-col h-full">
      {/* ── Header: Import strip ── */}
      <div className="px-6 pt-5 pb-4 border-b border-[--color-border] shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-medium px-3 py-1.5 rounded-full text-[--color-ink-muted] bg-[--color-ghost-btn] hover:text-[--color-ink] transition-colors whitespace-nowrap cursor-pointer">
                Import Goodreads CSV
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
            </label>
            {importMessage && (
              <span className="text-xs text-[--color-green] font-medium">{importMessage}</span>
            )}
          </div>
          <span className="text-xs text-[--color-ink-light] shrink-0">
            {visibleBooks.length}{shelfFilter !== "all" || query ? ` / ${books.length}` : ""}{" "}
            {books.length === 1 ? "book" : "books"}
          </span>
        </div>
      </div>

      {/* ── Search + shelf filter ── */}
      <div className="px-6 pt-4 pb-3 shrink-0 space-y-3">
        {/* Search */}
        <div>
          <label htmlFor="library-search" className="sr-only">Search your library</label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-ink-light] pointer-events-none"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              id="library-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or author…"
              className={inputClass + " pl-9"}
            />
          </div>
        </div>

        {/* Shelf filter pills */}
        {shelfOptions.length > 1 && (
          <div
            role="group"
            aria-label="Filter by shelf"
            className="flex flex-wrap gap-1.5"
          >
            {shelfOptions.map((option) => {
              const isActive = shelfFilter === option.id;
              const count = shelfCounts[option.id];
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setShelfFilter(option.id)}
                  aria-pressed={isActive}
                  className={[
                    "text-xs font-medium px-3 py-1 rounded-full transition-all",
                    isActive
                      ? "bg-[--color-espresso] text-[--color-parchment] shadow-sm"
                      : "bg-[--color-ghost-btn] text-[--color-ink-muted] hover:bg-[--color-border-mid] hover:text-[--color-ink]",
                  ].join(" ")}
                >
                  {option.label}
                  {option.id !== "all" && (
                    <span
                      className={`ml-1.5 ${isActive ? "opacity-70" : "opacity-50"}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Book list ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {books.length === 0 ? (
          /* Empty library state */
          <div className="flex flex-col items-start px-3 pt-8 gap-3">
            <p className="font-serif text-base text-[--color-ink-muted] leading-relaxed">
              Your library is empty. Import a Goodreads CSV to get started.
            </p>
          </div>
        ) : visibleBooks.length === 0 ? (
          <p className="text-sm text-[--color-ink-muted] px-3 pt-6">
            No books match your search.
          </p>
        ) : (
          <div className="divide-y divide-[--color-border]/40">
            {visibleBooks.map((book) => {
              const dateLabel = formatDate(book.dateRead) ?? (book.metadata.publicationYear ? String(book.metadata.publicationYear) : undefined);
              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => onSelectBook(book.id)}
                  className="w-full text-left flex items-start gap-3.5 px-3 py-3.5 hover:bg-[--color-cream] transition-colors group"
                >
                  {/* Cover thumbnail placeholder */}
                  <div
                    className="shrink-0 w-9 h-[54px] rounded-md bg-[--color-cream] border border-[--color-border] flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg className="w-4 h-4 text-[--color-border-mid]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[--color-ink] leading-snug m-0 group-hover:text-[--color-espresso] line-clamp-2">
                        {book.title}
                      </p>
                      <ShelfBadge shelf={book.shelf} />
                    </div>
                    <p className="text-xs text-[--color-ink-muted] mt-0.5 m-0">{book.author}</p>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {book.userRating ? (
                        <StarRating rating={book.userRating} />
                      ) : null}
                      {dateLabel ? (
                        <span className="text-[0.7rem] text-[--color-ink-light]">{dateLabel}</span>
                      ) : null}
                      {book.metadata.pageCount ? (
                        <span className="text-[0.7rem] text-[--color-ink-light]">
                          {book.metadata.pageCount} pp
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
