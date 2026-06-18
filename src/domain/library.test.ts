import type { Book } from "./types";
import { addBook, removeBook, updateBook, booksByShelf, upsertBook } from "./library";

const baseBook: Book = {
  id: "book-1",
  title: "Parable of the Sower",
  author: "Octavia E. Butler",
  shelf: "want-to-read",
  userNotes: "",
  sourceLinks: [],
  metadata: { genres: [], themes: [], description: "" }
};

describe("library", () => {
  it("adds a book with trimmed title and author", () => {
    const books = addBook([], { ...baseBook, title: "  Dune  ", author: " Frank Herbert " });

    expect(books[0].title).toBe("Dune");
    expect(books[0].author).toBe("Frank Herbert");
  });

  it("updates existing book fields without losing metadata", () => {
    const books = updateBook([baseBook], "book-1", { shelf: "read", userRating: 5 });

    expect(books[0].shelf).toBe("read");
    expect(books[0].userRating).toBe(5);
    expect(books[0].metadata).toEqual(baseBook.metadata);
  });

  it("removes a book by id", () => {
    expect(removeBook([baseBook], "book-1")).toEqual([]);
  });

  it("groups books by shelf", () => {
    expect(booksByShelf([baseBook], "want-to-read")).toEqual([baseBook]);
    expect(booksByShelf([baseBook], "read")).toEqual([]);
  });

  it("upserts by title and author case-insensitively", () => {
    const books = upsertBook([baseBook], { ...baseBook, id: "book-2", title: "parable of the sower" });

    expect(books).toHaveLength(1);
    expect(books[0].id).toBe("book-1");
  });
});
