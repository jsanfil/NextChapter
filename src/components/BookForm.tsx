import { useState } from "react";
import { buildSourceLinks } from "../domain/externalLinks";
import { createId } from "../domain/ids";
import type { Book, LinkSourceSetting, Shelf } from "../domain/types";

interface BookFormProps {
  linkSources: LinkSourceSetting[];
  submitLabel: string;
  initialBook?: Book;
  onSubmit: (book: Book) => void;
}

export default function BookForm({ linkSources, submitLabel, initialBook, onSubmit }: BookFormProps) {
  const [title, setTitle] = useState(initialBook?.title || "");
  const [author, setAuthor] = useState(initialBook?.author || "");
  const [shelf, setShelf] = useState<Shelf>(initialBook?.shelf || "want-to-read");
  const [userNotes, setUserNotes] = useState(initialBook?.userNotes || "");

  const fieldLabel = "block text-xs font-medium text-[--color-ink-muted] mb-1";
  const inputClass =
    "w-full rounded-xl bg-[--color-input-bg] shadow-sm text-[--color-ink] placeholder:text-[--color-ink-light] px-3 py-2 text-sm focus:outline-none transition-colors";

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const book = {
          id: initialBook?.id || createId("book"),
          title,
          author,
          shelf,
          userNotes,
          sourceLinks: [],
          metadata: initialBook?.metadata || { genres: [], themes: [], description: "" },
        } satisfies Book;

        onSubmit({ ...book, sourceLinks: buildSourceLinks(book, linkSources) });

        if (!initialBook) {
          setTitle("");
          setAuthor("");
          setUserNotes("");
          setShelf("want-to-read");
        }
      }}
    >
      <div>
        <label className={fieldLabel} htmlFor="book-form-title">Title</label>
        <input
          id="book-form-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={fieldLabel} htmlFor="book-form-author">Author</label>
        <input
          id="book-form-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className={fieldLabel} htmlFor="book-form-shelf">Shelf</label>
        <select
          id="book-form-shelf"
          value={shelf}
          onChange={(e) => setShelf(e.target.value as Shelf)}
          className={inputClass}
        >
          <option value="want-to-read">Want to read</option>
          <option value="read">Read</option>
          <option value="none">No shelf</option>
        </select>
      </div>
      <div>
        <label className={fieldLabel} htmlFor="book-form-notes">Notes</label>
        <textarea
          id="book-form-notes"
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          rows={3}
          className={inputClass + " resize-y"}
        />
      </div>
      <button
        type="submit"
        className="w-full text-sm px-4 py-2 rounded-full bg-[--color-espresso] text-[--color-parchment] hover:bg-[--color-espresso-hover] transition-colors font-medium"
      >
        {submitLabel}
      </button>
    </form>
  );
}
