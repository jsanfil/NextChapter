import { screen } from "@testing-library/react";
import type { Book, LinkSourceSetting } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import LibraryView from "./LibraryView";

const linkSources: LinkSourceSetting[] = [
  { id: "goodreads", label: "Goodreads", enabled: true, order: 1 }
];

describe("LibraryView", () => {
  it("adds a manual want-to-read book", async () => {
    const added: Book[] = [];
    const { user } = renderWithUser(
      <LibraryView books={[]} linkSources={linkSources} onBooksChange={(books) => added.push(...books)} onSelectBook={() => undefined} />
    );

    await user.type(screen.getByLabelText("Title"), "The Dog Stars");
    await user.type(screen.getByLabelText("Author"), "Peter Heller");
    await user.selectOptions(screen.getByLabelText("Shelf"), "want-to-read");
    await user.click(screen.getByRole("button", { name: "Add book" }));

    expect(added[0]).toMatchObject({ title: "The Dog Stars", author: "Peter Heller", shelf: "want-to-read" });
  });
});
