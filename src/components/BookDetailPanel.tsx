import type { Book, BookLinkTarget, CatalogBookMetadata } from "../domain/types";

interface BookDetailPanelProps {
  book?: Book | BookLinkTarget;
  catalog?: CatalogBookMetadata;
  isLoadingCatalog?: boolean;
}

function isLocalBook(book: Book | BookLinkTarget): book is Book {
  return "id" in book && "shelf" in book;
}

function shelfLabel(book: Book | BookLinkTarget): string {
  if (!isLocalBook(book)) {
    return "Not in your library";
  }

  if (book.shelf === "want-to-read") {
    return "Want to read";
  }

  if (book.shelf === "read") {
    return "Read";
  }

  return "Not in your library";
}

function displayDate(book: Book | BookLinkTarget, catalog?: CatalogBookMetadata): string | undefined {
  return catalog?.publishedDate ?? book.metadata.publishedDate ?? book.metadata.publicationYear?.toString();
}

function displayGenres(book: Book | BookLinkTarget, catalog?: CatalogBookMetadata): string[] {
  const genres = catalog?.categories ?? book.metadata.categories ?? book.metadata.genres;
  return genres.filter(Boolean);
}

function displaySummary(book: Book | BookLinkTarget, catalog?: CatalogBookMetadata): string {
  return catalog?.summary || book.metadata.description || "No local summary is available yet.";
}

export default function BookDetailPanel({ book, catalog, isLoadingCatalog = false }: BookDetailPanelProps) {
  if (!book) {
    return (
      <article className="detail-panel empty-detail">
        <p>Select a linked book in chat to see metadata, shelf status, summary, and source links.</p>
      </article>
    );
  }

  const coverUrl = catalog?.coverUrl ?? book.metadata.coverUrl;
  const pageCount = catalog?.pageCount ?? book.metadata.pageCount;
  const publisher = catalog?.publisher ?? book.metadata.publisher;
  const sourceLinks = book.sourceLinks;
  const genres = displayGenres(book, catalog);

  return (
    <article className="detail-panel">
      {coverUrl ? <img className="book-cover" src={coverUrl} alt={`Cover of ${book.title}`} /> : null}
      <div className="detail-heading">
        <p className="shelf-pill">{shelfLabel(book)}</p>
        <h2>{book.title}</h2>
        <p className="book-author">{catalog?.author ?? book.author}</p>
      </div>

      <dl className="metadata-list">
        {publisher ? (
          <>
            <dt>Publisher</dt>
            <dd>{publisher}</dd>
          </>
        ) : null}
        {displayDate(book, catalog) ? (
          <>
            <dt>Published</dt>
            <dd>{displayDate(book, catalog)}</dd>
          </>
        ) : null}
        {pageCount ? (
          <>
            <dt>Length</dt>
            <dd>{pageCount} pages</dd>
          </>
        ) : null}
        {genres.length > 0 ? (
          <>
            <dt>Genre</dt>
            <dd>{genres.join(", ")}</dd>
          </>
        ) : null}
        {catalog?.catalogSource ?? book.metadata.catalogSource ? (
          <>
            <dt>Source</dt>
            <dd>{catalog?.catalogSource ?? book.metadata.catalogSource}</dd>
          </>
        ) : null}
      </dl>

      {isLoadingCatalog ? <p className="catalog-status">Looking up catalog metadata...</p> : null}

      <section className="detail-section">
        <h3>Summary</h3>
        <p>{displaySummary(book, catalog)}</p>
      </section>

      {isLocalBook(book) && book.userRating ? <p>Rating: {book.userRating}/5</p> : null}
      {isLocalBook(book) && book.userNotes ? (
        <section className="detail-section">
          <h3>Your notes</h3>
          <p>{book.userNotes}</p>
        </section>
      ) : null}
      {!isLocalBook(book) && book.rationale ? (
        <section className="detail-section">
          <h3>Why it came up</h3>
          <p>{book.rationale}</p>
        </section>
      ) : null}
      <div className="external-links">
        {sourceLinks.map((link) => (
          <a href={link.url} key={link.id} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
