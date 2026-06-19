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
  if (!isLocalBook(book)) return "Not in your library";
  if (book.shelf === "want-to-read") return "Want to read";
  if (book.shelf === "read") return "Read";
  return "Not in your library";
}

function shelfColor(book: Book | BookLinkTarget): string {
  if (!isLocalBook(book)) return "text-[--color-ink-light] bg-[--color-cream]";
  if (book.shelf === "read") return "text-[--color-green] bg-[--color-green-bg]";
  if (book.shelf === "want-to-read") return "text-[--color-amber] bg-[--color-amber-bg]";
  return "text-[--color-ink-light] bg-[--color-cream]";
}

function displayDate(book: Book | BookLinkTarget, catalog?: CatalogBookMetadata): string | undefined {
  return catalog?.publishedDate ?? book.metadata.publishedDate ?? book.metadata.publicationYear?.toString();
}

function displayGenres(book: Book | BookLinkTarget, catalog?: CatalogBookMetadata): string[] {
  const genres = catalog?.categories ?? book.metadata.categories ?? book.metadata.genres;
  return genres.filter(Boolean);
}

function displaySummary(book: Book | BookLinkTarget, catalog?: CatalogBookMetadata): string {
  return catalog?.summary || book.metadata.description || "No summary available yet.";
}

/* ── Small section heading ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber] mb-2 mt-0">
      {children}
    </p>
  );
}

export default function BookDetailPanel({ book, catalog, isLoadingCatalog = false }: BookDetailPanelProps) {
  if (!book) {
    return (
      <div className="flex flex-col items-start justify-center h-full px-8 py-12">
        <p className="font-serif text-lg text-[--color-ink-muted] leading-relaxed max-w-xs">
          Select a book in chat to inspect its details, shelf status, and summary here.
        </p>
      </div>
    );
  }

  const coverUrl = catalog?.coverUrl ?? book.metadata.coverUrl;
  const pageCount = catalog?.pageCount ?? book.metadata.pageCount;
  const publisher = catalog?.publisher ?? book.metadata.publisher;
  const sourceLinks = book.sourceLinks;
  const genres = displayGenres(book, catalog);
  const date = displayDate(book, catalog);

  return (
    <article className="px-7 py-6 space-y-6 overflow-y-auto">
      {/* Cover + identity */}
      <div className="flex gap-5 items-start">
        {coverUrl ? (
          <img
            className="w-[88px] shrink-0 aspect-[2/3] object-cover rounded-xl shadow-sm"
            src={coverUrl}
            alt={`Cover of ${book.title}`}
          />
        ) : (
          <div
            className="w-[88px] shrink-0 aspect-[2/3] rounded-xl bg-[--color-cream] flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="font-serif text-2xl text-[--color-border-mid]">—</span>
          </div>
        )}

        <div className="min-w-0 space-y-1.5">
          <span
            className={`inline-block text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full ${shelfColor(book)}`}
          >
            {shelfLabel(book)}
          </span>
          <h2 className="font-serif text-xl font-semibold text-[--color-ink] leading-snug m-0 text-balance">
            {book.title}
          </h2>
          <p className="text-sm text-[--color-ink-muted] font-medium m-0">
            {catalog?.author ?? book.author}
          </p>
        </div>
      </div>

      {/* Metadata grid */}
      {(publisher || date || pageCount || genres.length > 0) ? (
        <div>
          <SectionLabel>Details</SectionLabel>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
            {publisher ? (
              <>
                <dt className="text-[--color-ink-muted] font-medium whitespace-nowrap">Publisher</dt>
                <dd className="text-[--color-ink] m-0">{publisher}</dd>
              </>
            ) : null}
            {date ? (
              <>
                <dt className="text-[--color-ink-muted] font-medium">Published</dt>
                <dd className="text-[--color-ink] m-0">{date}</dd>
              </>
            ) : null}
            {pageCount ? (
              <>
                <dt className="text-[--color-ink-muted] font-medium">Length</dt>
                <dd className="text-[--color-ink] m-0">{pageCount} pages</dd>
              </>
            ) : null}
            {genres.length > 0 ? (
              <>
                <dt className="text-[--color-ink-muted] font-medium">Genre</dt>
                <dd className="text-[--color-ink] m-0">{genres.join(", ")}</dd>
              </>
            ) : null}
          </dl>
        </div>
      ) : null}

      {isLoadingCatalog ? (
        <p className="text-xs text-[--color-amber] font-medium animate-pulse">
          Looking up catalog data&hellip;
        </p>
      ) : null}

      {/* Summary */}
      <div>
        <SectionLabel>Summary</SectionLabel>
        <p className="text-sm text-[--color-ink] leading-[1.75] m-0 font-serif">
          {displaySummary(book, catalog)}
        </p>
      </div>

      {/* Rating */}
      {isLocalBook(book) && book.userRating ? (
        <div>
          <SectionLabel>Your rating</SectionLabel>
          <p className="text-sm text-[--color-ink]">
            {book.userRating} / 5
          </p>
        </div>
      ) : null}

      {/* User notes */}
      {isLocalBook(book) && book.userNotes ? (
        <div>
          <SectionLabel>Your notes</SectionLabel>
          <p className="text-sm text-[--color-ink] leading-[1.75] m-0 font-serif whitespace-pre-wrap">
            {book.userNotes}
          </p>
        </div>
      ) : null}

      {/* Why it came up */}
      {!isLocalBook(book) && book.rationale ? (
        <div>
          <SectionLabel>Why it came up</SectionLabel>
          <p className="text-sm text-[--color-ink] leading-[1.75] m-0 font-serif">{book.rationale}</p>
        </div>
      ) : null}

      {/* External links */}
      {sourceLinks.length > 0 ? (
        <div>
          <SectionLabel>Find it</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {sourceLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-[--color-green] bg-[--color-green-bg] rounded-full px-3 py-1 hover:opacity-80 transition-opacity no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
