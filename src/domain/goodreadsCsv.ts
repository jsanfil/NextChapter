import Papa from "papaparse";
import { buildSourceLinks } from "./externalLinks";
import { createId } from "./ids";
import type { Book, LinkSourceSetting, Shelf } from "./types";

interface GoodreadsRow {
  "Book Id"?: string;
  Title?: string;
  Author?: string;
  ISBN?: string;
  ISBN13?: string;
  "My Rating"?: string;
  "Date Read"?: string;
  Bookshelves?: string;
  "Exclusive Shelf"?: string;
  "My Review"?: string;
  "Number of Pages"?: string;
  "Original Publication Year"?: string;
  "Year Published"?: string;
}

export interface ImportSkippedRow {
  rowNumber: number;
  reason: string;
}

export interface GoodreadsImportSummary {
  imported: Book[];
  skipped: ImportSkippedRow[];
}

interface ParseOptions {
  linkSources: LinkSourceSetting[];
}

function cleanIsbn(value?: string): string | undefined {
  const cleaned = (value || "").replace(/[="]/g, "").trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function parseRating(value?: string): number | undefined {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating : undefined;
}

function parseDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const match = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : trimmed;
}

function parseShelf(value?: string): Shelf {
  if (value === "read") {
    return "read";
  }
  if (value === "to-read" || value === "want-to-read") {
    return "want-to-read";
  }
  return "none";
}

function parseNumber(value?: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseGoodreadsCsv(csv: string, options: ParseOptions): GoodreadsImportSummary {
  const result = Papa.parse<GoodreadsRow>(csv, {
    header: true,
    skipEmptyLines: true
  });

  const imported: Book[] = [];
  const skipped: ImportSkippedRow[] = [];

  result.data.forEach((row, index) => {
    const rowNumber = index + 2;
    const title = (row.Title || "").trim();
    const author = (row.Author || "").trim();

    if (!title) {
      skipped.push({ rowNumber, reason: "Missing title" });
      return;
    }

    if (!author) {
      skipped.push({ rowNumber, reason: "Missing author" });
      return;
    }

    const isbn = cleanIsbn(row.ISBN);
    const isbn13 = cleanIsbn(row.ISBN13);
    const publicationYear = parseNumber(row["Original Publication Year"]) || parseNumber(row["Year Published"]);
    const pageCount = parseNumber(row["Number of Pages"]);
    const book = {
      id: createId("book"),
      title,
      author,
      shelf: parseShelf(row["Exclusive Shelf"]),
      userRating: parseRating(row["My Rating"]),
      userNotes: (row["My Review"] || "").trim(),
      dateRead: parseDate(row["Date Read"]),
      isbn,
      isbn13,
      goodreadsId: (row["Book Id"] || "").trim() || undefined,
      sourceLinks: [],
      metadata: {
        genres: (row.Bookshelves || "")
          .split(",")
          .map((shelf) => shelf.trim())
          .filter(Boolean),
        themes: [],
        description: "",
        pageCount,
        publicationYear
      }
    } satisfies Book;

    imported.push({
      ...book,
      sourceLinks: buildSourceLinks(book, options.linkSources)
    });
  });

  return { imported, skipped };
}
