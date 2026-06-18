import type { LinkSourceSetting, SourceLink } from "./types";

export interface LinkBookInput {
  title: string;
  author: string;
  goodreadsId?: string;
  isbn?: string;
  isbn13?: string;
}

function bookQuery(book: LinkBookInput): string {
  return encodeURIComponent(`${book.title} ${book.author}`.trim());
}

function sourceUrl(book: LinkBookInput, sourceId: LinkSourceSetting["id"]): string {
  const query = bookQuery(book);
  const isbn = book.isbn13 ?? book.isbn;

  switch (sourceId) {
    case "goodreads":
      return book.goodreadsId
        ? `https://www.goodreads.com/book/show/${encodeURIComponent(book.goodreadsId)}`
        : `https://www.goodreads.com/search?q=${query}`;
    case "open-library":
      return isbn
        ? `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}`
        : `https://openlibrary.org/search?q=${query}`;
    case "google-books":
      return `https://www.google.com/search?tbm=bks&q=${query}`;
    case "amazon":
      return `https://www.amazon.com/s?k=${query}`;
  }
}

export function buildSourceLinks(book: LinkBookInput, settings: LinkSourceSetting[]): SourceLink[] {
  return settings
    .filter((setting) => setting.enabled)
    .sort((left, right) => left.order - right.order)
    .map((setting) => ({
      id: setting.id,
      label: setting.label,
      url: sourceUrl(book, setting.id),
      enabled: setting.enabled
    }));
}
