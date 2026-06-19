import { screen } from "@testing-library/react";
import { renderWithUser } from "../test/testUtils";
import BookDetailPanel from "./BookDetailPanel";
import type { Book, BookLinkTarget, CatalogBookMetadata } from "../domain/types";

const book: Book = {
  id: "book-1",
  title: "Piranesi",
  author: "Susanna Clarke",
  shelf: "want-to-read",
  userRating: 5,
  userNotes: "Already on my shelf.",
  sourceLinks: [{ id: "goodreads", label: "Goodreads", url: "https://goodreads.test/piranesi", enabled: true }],
  metadata: {
    genres: ["fantasy"],
    themes: ["labyrinth"],
    description: "Imported description.",
    pageCount: 272,
    publicationYear: 2020
  }
};

const catalog: CatalogBookMetadata = {
  title: "Piranesi",
  author: "Susanna Clarke",
  publisher: "Bloomsbury",
  publishedDate: "2020-09-15",
  pageCount: 272,
  categories: ["Fiction / Fantasy"],
  coverUrl: "https://covers.test/piranesi.jpg",
  summary: "A man explores a vast house filled with statues and tides.",
  catalogSource: "Google Books"
};

describe("BookDetailPanel", () => {
  it("shows shelf status, catalog metadata, cover, summary, and external links for a local book", () => {
    renderWithUser(<BookDetailPanel book={book} catalog={catalog} isLoadingCatalog={false} />);

    expect(screen.getByRole("heading", { name: "Piranesi" })).toBeInTheDocument();
    expect(screen.getByText("Susanna Clarke")).toBeInTheDocument();
    expect(screen.getByText("Want to read")).toBeInTheDocument();
    expect(screen.getByText("Bloomsbury")).toBeInTheDocument();
    expect(screen.getByText("272 pages")).toBeInTheDocument();
    expect(screen.getByText("Fiction / Fantasy")).toBeInTheDocument();
    expect(screen.getByText("A man explores a vast house filled with statues and tides.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cover of Piranesi" })).toHaveAttribute(
      "src",
      "https://covers.test/piranesi.jpg"
    );
    expect(screen.getByRole("link", { name: "Goodreads" })).toHaveAttribute("href", "https://goodreads.test/piranesi");
  });

  it("shows a new-discovery status for an ephemeral recommended book", () => {
    const target: BookLinkTarget = {
      title: "Starter Villain",
      author: "John Scalzi",
      sourceLinks: [],
      metadata: { genres: ["science fiction"], themes: ["humor"], description: "A supervillain inheritance." }
    };

    renderWithUser(<BookDetailPanel book={target} catalog={undefined} isLoadingCatalog={false} />);

    expect(screen.getByRole("heading", { name: "Starter Villain" })).toBeInTheDocument();
    expect(screen.getByText("Not in your library")).toBeInTheDocument();
    expect(screen.getByText("A supervillain inheritance.")).toBeInTheDocument();
  });
});
