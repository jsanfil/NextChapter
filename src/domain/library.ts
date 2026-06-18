import type { Book, Shelf } from "./types";

function normalizeText(value: string): string {
  return value.trim();
}

function sameBook(left: Pick<Book, "title" | "author">, right: Pick<Book, "title" | "author">): boolean {
  return (
    normalizeText(left.title).toLowerCase() === normalizeText(right.title).toLowerCase() &&
    normalizeText(left.author).toLowerCase() === normalizeText(right.author).toLowerCase()
  );
}

export function cleanBook(book: Book): Book {
  return {
    ...book,
    title: normalizeText(book.title),
    author: normalizeText(book.author),
    userNotes: normalizeText(book.userNotes)
  };
}

export function addBook(books: Book[], book: Book): Book[] {
  return [...books, cleanBook(book)];
}

export function updateBook(books: Book[], id: string, patch: Partial<Book>): Book[] {
  return books.map((book) => (book.id === id ? cleanBook({ ...book, ...patch }) : book));
}

export function removeBook(books: Book[], id: string): Book[] {
  return books.filter((book) => book.id !== id);
}

export function booksByShelf(books: Book[], shelf: Shelf): Book[] {
  return books.filter((book) => book.shelf === shelf);
}

export function upsertBook(books: Book[], incomingBook: Book): Book[] {
  const existingBook = books.find((book) => sameBook(book, incomingBook));

  if (!existingBook) {
    return addBook(books, incomingBook);
  }

  const mergedBook: Book = {
    ...existingBook,
    ...incomingBook,
    id: existingBook.id,
    sourceLinks: incomingBook.sourceLinks.length > 0 ? incomingBook.sourceLinks : existingBook.sourceLinks,
    metadata: {
      ...existingBook.metadata,
      ...incomingBook.metadata,
      genres: incomingBook.metadata.genres.length > 0 ? incomingBook.metadata.genres : existingBook.metadata.genres,
      themes: incomingBook.metadata.themes.length > 0 ? incomingBook.metadata.themes : existingBook.metadata.themes
    }
  };

  return books.map((book) => (book.id === existingBook.id ? cleanBook(mergedBook) : book));
}
