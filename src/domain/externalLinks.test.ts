import { buildSourceLinks } from "./externalLinks";
import type { LinkSourceSetting } from "./types";

const settings: LinkSourceSetting[] = [
  { id: "amazon", label: "Amazon", enabled: true, order: 4 },
  { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
  { id: "open-library", label: "Open Library", enabled: true, order: 2 },
  { id: "google-books", label: "Google Books", enabled: false, order: 3 }
];

describe("externalLinks", () => {
  it("builds ordered enabled links from book data", () => {
    const links = buildSourceLinks(
      {
        title: "Station Eleven",
        author: "Emily St. John Mandel",
        goodreadsId: "20170404",
        isbn13: "9780385353304"
      },
      settings
    );

    expect(links.map((link) => link.label)).toEqual(["Goodreads", "Open Library", "Amazon"]);
    expect(links[0].url).toContain("20170404");
    expect(links[1].url).toContain("9780385353304");
    expect(links[2].url).toContain("Station%20Eleven");
  });
});
