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

  return (
    <form
      className="book-form"
      onSubmit={(event) => {
        event.preventDefault();
        const book = {
          id: initialBook?.id || createId("book"),
          title,
          author,
          shelf,
          userNotes,
          sourceLinks: [],
          metadata: initialBook?.metadata || { genres: [], themes: [], description: "" }
        } satisfies Book;

        onSubmit({
          ...book,
          sourceLinks: buildSourceLinks(book, linkSources)
        });

        if (!initialBook) {
          setTitle("");
          setAuthor("");
          setUserNotes("");
          setShelf("want-to-read");
        }
      }}
    >
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Author
        <input value={author} onChange={(event) => setAuthor(event.target.value)} required />
      </label>
      <label>
        Shelf
        <select value={shelf} onChange={(event) => setShelf(event.target.value as Shelf)}>
          <option value="want-to-read">Want to read</option>
          <option value="read">Read</option>
          <option value="none">No shelf</option>
        </select>
      </label>
      <label>
        Notes
        <textarea value={userNotes} onChange={(event) => setUserNotes(event.target.value)} rows={3} />
      </label>
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
