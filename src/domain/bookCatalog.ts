import type { BookLinkTarget, BookMetadata, CatalogBookMetadata } from "./types";

interface GoogleVolumeInfo {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };
}

interface GoogleBooksResponse {
  items?: Array<{
    volumeInfo?: GoogleVolumeInfo;
  }>;
}

interface OpenLibrarySearchResponse {
  docs?: Array<{
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    number_of_pages_median?: number;
    subject?: string[];
    cover_i?: number;
    key?: string;
  }>;
}

interface OpenLibraryWorkResponse {
  description?: string | { value?: string };
}

export interface CatalogLookupOptions {
  fetcher?: typeof fetch;
}

function httpsUrl(url?: string): string | undefined {
  return url?.replace(/^http:\/\//, "https://");
}

function catalogQuery(book: BookLinkTarget): string {
  const isbn = book.isbn13 ?? book.isbn;
  if (isbn) {
    return `isbn:${isbn}`;
  }

  return `intitle:${book.title} inauthor:${book.author}`;
}

function openLibrarySearchUrl(book: BookLinkTarget): string {
  const isbn = book.isbn13 ?? book.isbn;
  if (isbn) {
    return `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}&limit=1`;
  }

  return `https://openlibrary.org/search.json?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&limit=1`;
}

function fallbackMetadata(book: BookLinkTarget): CatalogBookMetadata {
  return {
    title: book.title,
    author: book.author,
    pageCount: book.metadata.pageCount,
    categories: book.metadata.categories ?? book.metadata.genres,
    summary: book.metadata.description,
    catalogSource: book.metadata.catalogSource || "Recommendation"
  };
}

function fromGoogleVolume(book: BookLinkTarget, volume: GoogleVolumeInfo): CatalogBookMetadata {
  return {
    title: volume.title || book.title,
    author: volume.authors?.join(", ") || book.author,
    publisher: volume.publisher,
    publishedDate: volume.publishedDate,
    pageCount: volume.pageCount,
    categories: volume.categories,
    coverUrl: httpsUrl(volume.imageLinks?.thumbnail ?? volume.imageLinks?.smallThumbnail),
    summary: volume.description,
    catalogSource: "Google Books"
  };
}

function openLibraryDescription(work?: OpenLibraryWorkResponse): string | undefined {
  if (!work?.description) {
    return undefined;
  }

  return typeof work.description === "string" ? work.description : work.description.value;
}

async function fetchOpenLibraryMetadata(book: BookLinkTarget, fetcher: typeof fetch): Promise<CatalogBookMetadata | undefined> {
  const response = await fetcher(openLibrarySearchUrl(book));
  if (!response.ok) {
    return undefined;
  }

  const body = (await response.json()) as OpenLibrarySearchResponse;
  const doc = body.docs?.[0];
  if (!doc) {
    return undefined;
  }

  let summary: string | undefined;
  if (doc.key) {
    try {
      const workResponse = await fetcher(`https://openlibrary.org${doc.key}.json`);
      if (workResponse.ok) {
        summary = openLibraryDescription((await workResponse.json()) as OpenLibraryWorkResponse);
      }
    } catch {
      summary = undefined;
    }
  }

  return {
    title: doc.title || book.title,
    author: doc.author_name?.join(", ") || book.author,
    publishedDate: doc.first_publish_year?.toString(),
    pageCount: doc.number_of_pages_median,
    categories: doc.subject?.slice(0, 8),
    coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
    summary: summary || book.metadata.description,
    catalogSource: "Open Library"
  };
}

export async function fetchCatalogMetadata(
  book: BookLinkTarget,
  options: CatalogLookupOptions = {}
): Promise<CatalogBookMetadata> {
  const fetcher = options.fetcher ?? fetch;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(catalogQuery(book))}&maxResults=1`;

  try {
    const response = await fetcher(url);
    if (!response.ok) {
      return (await fetchOpenLibraryMetadata(book, fetcher)) ?? fallbackMetadata(book);
    }

    const body = (await response.json()) as GoogleBooksResponse;
    const volume = body.items?.[0]?.volumeInfo;
    if (volume) {
      return fromGoogleVolume(book, volume);
    }

    return (await fetchOpenLibraryMetadata(book, fetcher)) ?? fallbackMetadata(book);
  } catch {
    try {
      return (await fetchOpenLibraryMetadata(book, fetcher)) ?? fallbackMetadata(book);
    } catch {
      return fallbackMetadata(book);
    }
  }
}

export function mergeBookMetadata(base: BookMetadata, catalog?: CatalogBookMetadata): BookMetadata {
  if (!catalog) {
    return base;
  }

  const categories = catalog.categories ?? [];
  const genres = [...base.genres];
  categories.forEach((category) => {
    if (!genres.includes(category)) {
      genres.push(category);
    }
  });

  return {
    ...base,
    genres,
    description: catalog.summary || base.description,
    pageCount: catalog.pageCount ?? base.pageCount,
    publicationYear: catalog.publishedDate ? Number(catalog.publishedDate.slice(0, 4)) || base.publicationYear : base.publicationYear,
    publisher: catalog.publisher ?? base.publisher,
    publishedDate: catalog.publishedDate ?? base.publishedDate,
    categories: catalog.categories ?? base.categories,
    coverUrl: catalog.coverUrl ?? base.coverUrl,
    catalogSource: catalog.catalogSource
  };
}

export function catalogCacheKey(book: BookLinkTarget): string {
  const identity = book.localBookId ?? book.isbn13 ?? book.isbn ?? `${book.title}|${book.author}`;
  return identity.toLowerCase();
}
