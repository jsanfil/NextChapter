import { describe, expect, it, vi } from "vitest";
import { fetchCatalogMetadata, mergeBookMetadata } from "./bookCatalog";
import type { BookLinkTarget } from "./types";

const target: BookLinkTarget = {
  title: "Piranesi",
  author: "Susanna Clarke",
  isbn13: "9781635575637",
  sourceLinks: [],
  metadata: { genres: ["fantasy"], themes: ["labyrinth"], description: "Model summary fallback." }
};

describe("bookCatalog", () => {
  it("uses Google Books catalog fields when lookup succeeds", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(decodeURIComponent(url)).toContain("isbn:9781635575637");
      return new Response(
        JSON.stringify({
          items: [
            {
              volumeInfo: {
                title: "Piranesi",
                authors: ["Susanna Clarke"],
                publisher: "Bloomsbury",
                publishedDate: "2020-09-15",
                description: "A man explores a vast house filled with statues and tides.",
                pageCount: 272,
                categories: ["Fiction / Fantasy"],
                imageLinks: { thumbnail: "http://books.google.com/cover.jpg" }
              }
            }
          ]
        })
      );
    });

    const metadata = await fetchCatalogMetadata(target, { fetcher });

    expect(metadata).toMatchObject({
      title: "Piranesi",
      author: "Susanna Clarke",
      publisher: "Bloomsbury",
      publishedDate: "2020-09-15",
      pageCount: 272,
      catalogSource: "Google Books",
      summary: "A man explores a vast house filled with statues and tides."
    });
    expect(metadata.coverUrl).toBe("https://books.google.com/cover.jpg");
  });

  it("falls back to the recommendation metadata when catalog lookup fails", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("network down");
    });

    const metadata = await fetchCatalogMetadata(target, { fetcher });

    expect(metadata).toMatchObject({
      title: "Piranesi",
      author: "Susanna Clarke",
      summary: "Model summary fallback.",
      catalogSource: "Recommendation"
    });
  });

  it("uses Open Library when Google Books has no matching volume", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("googleapis")) {
        return new Response(JSON.stringify({ items: [] }));
      }
      if (url.includes("/search.json")) {
        return new Response(
          JSON.stringify({
            docs: [
              {
                title: "Piranesi",
                author_name: ["Susanna Clarke"],
                first_publish_year: 2020,
                number_of_pages_median: 272,
                subject: ["Labyrinths", "Fantasy"],
                cover_i: 12345,
                key: "/works/OL123W"
              }
            ]
          })
        );
      }

      return new Response(JSON.stringify({ description: { value: "Open Library work summary." } }));
    });

    const metadata = await fetchCatalogMetadata(target, { fetcher });

    expect(metadata).toMatchObject({
      title: "Piranesi",
      author: "Susanna Clarke",
      publishedDate: "2020",
      pageCount: 272,
      categories: ["Labyrinths", "Fantasy"],
      summary: "Open Library work summary.",
      catalogSource: "Open Library"
    });
    expect(metadata.coverUrl).toBe("https://covers.openlibrary.org/b/id/12345-L.jpg");
  });

  it("merges catalog metadata over imported metadata without losing local genres", () => {
    const merged = mergeBookMetadata(
      { genres: ["fantasy"], themes: ["labyrinth"], description: "Imported description." },
      {
        title: "Piranesi",
        author: "Susanna Clarke",
        summary: "Catalog description.",
        categories: ["Fiction / Fantasy"],
        catalogSource: "Google Books"
      }
    );

    expect(merged.description).toBe("Catalog description.");
    expect(merged.genres).toEqual(["fantasy", "Fiction / Fantasy"]);
    expect(merged.themes).toEqual(["labyrinth"]);
    expect(merged.catalogSource).toBe("Google Books");
  });
});
