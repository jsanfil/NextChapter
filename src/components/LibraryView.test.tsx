import { screen } from "@testing-library/react";
import type { Book, LinkSourceSetting } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import LibraryView from "./LibraryView";

const linkSources: LinkSourceSetting[] = [
  { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
];

const sampleBooks: Book[] = [
  {
    id: "book-1",
    title: "The Dog Stars",
    author: "Peter Heller",
    shelf: "read",
    userRating: 4,
    userNotes: "",
    dateRead: "2023-05-01",
    sourceLinks: [],
    metadata: { genres: [], themes: [], description: "", pageCount: 320 },
  },
  {
    id: "book-2",
    title: "Station Eleven",
    author: "Emily St. John Mandel",
    shelf: "want-to-read",
    userNotes: "",
    sourceLinks: [],
    metadata: { genres: [], themes: [], description: "" },
  },
];

describe("LibraryView", () => {
  it("renders books from the library", () => {
    renderWithUser(
      <LibraryView
        books={sampleBooks}
        linkSources={linkSources}
        onBooksChange={() => undefined}
        onSelectBook={() => undefined}
      />
    );

    expect(screen.getByText("The Dog Stars")).toBeInTheDocument();
    expect(screen.getByText("Station Eleven")).toBeInTheDocument();
  });

  it("filters books by shelf", async () => {
    const { user } = renderWithUser(
      <LibraryView
        books={sampleBooks}
        linkSources={linkSources}
        onBooksChange={() => undefined}
        onSelectBook={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: /want to read/i }));

    expect(screen.queryByText("The Dog Stars")).not.toBeInTheDocument();
    expect(screen.getByText("Station Eleven")).toBeInTheDocument();
  });

  it("calls onSelectBook when a book row is clicked", async () => {
    const selected: string[] = [];
    const { user } = renderWithUser(
      <LibraryView
        books={sampleBooks}
        linkSources={linkSources}
        onBooksChange={() => undefined}
        onSelectBook={(id) => selected.push(id)}
      />
    );

    await user.click(screen.getByText("The Dog Stars"));
    expect(selected[0]).toBe("book-1");
  });

  it("filters books by search query", async () => {
    const { user } = renderWithUser(
      <LibraryView
        books={sampleBooks}
        linkSources={linkSources}
        onBooksChange={() => undefined}
        onSelectBook={() => undefined}
      />
    );

    await user.type(screen.getByPlaceholderText(/search title or author/i), "Station");

    expect(screen.queryByText("The Dog Stars")).not.toBeInTheDocument();
    expect(screen.getByText("Station Eleven")).toBeInTheDocument();
  });
});
