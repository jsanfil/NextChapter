import type { Book } from "../domain/types";

interface BookDetailPanelProps {
  book?: Book;
}

export default function BookDetailPanel({ book }: BookDetailPanelProps) {
  if (!book) {
    return <p>Select a book to see details.</p>;
  }

  return (
    <article className="detail-panel">
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      <p>Shelf: {book.shelf}</p>
      {book.userRating ? <p>Rating: {book.userRating}/5</p> : null}
      {book.userNotes ? <p>{book.userNotes}</p> : null}
      {book.metadata.description ? <p>{book.metadata.description}</p> : null}
      <div className="external-links">
        {book.sourceLinks.map((link) => (
          <a href={link.url} key={link.id} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
