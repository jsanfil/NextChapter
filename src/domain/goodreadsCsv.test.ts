import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseGoodreadsCsv } from "./goodreadsCsv";

describe("goodreadsCsv", () => {
  it("imports read and want-to-read books with preserved Goodreads fields", () => {
    const csv = readFileSync(join(process.cwd(), "src/test/fixtures/goodreads-export.csv"), "utf8");

    const summary = parseGoodreadsCsv(csv, {
      linkSources: [
        { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
        { id: "open-library", label: "Open Library", enabled: true, order: 2 },
        { id: "google-books", label: "Google Books", enabled: true, order: 3 },
        { id: "amazon", label: "Amazon", enabled: true, order: 4 }
      ]
    });

    expect(summary.imported).toHaveLength(3);
    expect(summary.skipped).toEqual([]);
    expect(summary.imported[0]).toMatchObject({
      title: "Station Eleven",
      author: "Emily St. John Mandel",
      shelf: "read",
      userRating: 5,
      dateRead: "2022-01-10",
      goodreadsId: "20170404",
      isbn: "0385353308",
      isbn13: "9780385353304"
    });
    expect(summary.imported[1].shelf).toBe("want-to-read");
    expect(summary.imported[0].sourceLinks.map((link) => link.label)).toEqual([
      "Goodreads",
      "Open Library",
      "Google Books",
      "Amazon"
    ]);
  });

  it("reports skipped rows without a title or author", () => {
    const summary = parseGoodreadsCsv("Title,Author,Exclusive Shelf\n,Someone,read\nBook,,read", {
      linkSources: []
    });

    expect(summary.imported).toEqual([]);
    expect(summary.skipped).toEqual([
      { rowNumber: 2, reason: "Missing title" },
      { rowNumber: 3, reason: "Missing author" }
    ]);
  });
});
