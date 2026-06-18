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
      .filter((book) => `${book.title} ${book.author} ${book.userNotes}`.toLowerCase().includes(query.toLowerCase()))
      .sort((left, right) => left.title.localeCompare(right.title));
  }, [books, query, shelf]);

  async function importFile(file: File) {
    const csv = await file.text();
    const summary = parseGoodreadsCsv(csv, { linkSources });
    const merged = summary.imported.reduce((current, book) => upsertBook(current, book), books);
    onBooksChange(merged);
    setImportMessage(`Imported ${summary.imported.length} books. Skipped ${summary.skipped.length}.`);
  }

  return (
    <div className="library-view">
      <section className="toolbar">
        <label>
          Import Goodreads CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importFile(file);
              }
            }}
          />
        </label>
        {importMessage ? <p>{importMessage}</p> : null}
      </section>

      <section className="panel-grid">
        <div>
          <h3>Add book</h3>
          <BookForm
            linkSources={linkSources}
            submitLabel="Add book"
            onSubmit={(book) => onBooksChange(addBook(books, book))}
          />
        </div>
        <div>
          <h3>Browse library</h3>
          <div className="filters">
            <label>
              Search
              <input value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label>
              Filter shelf
              <select value={shelf} onChange={(event) => setShelf(event.target.value as Shelf | "all")}>
                <option value="all">All</option>
                <option value="read">Read ({booksByShelf(books, "read").length})</option>
                <option value="want-to-read">Want to read ({booksByShelf(books, "want-to-read").length})</option>
                <option value="none">No shelf</option>
              </select>
            </label>
          </div>
          <div className="book-list">
            {visibleBooks.map((book) => (
              <button className="book-row" type="button" key={book.id} onClick={() => onSelectBook(book.id)}>
                <strong>{book.title}</strong>
                <span>{book.author}</span>
                <small>{book.shelf}</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
