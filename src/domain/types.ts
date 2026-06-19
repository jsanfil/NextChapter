export type Shelf = "read" | "want-to-read" | "none";

export interface SourceLink {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface BookMetadata {
  genres: string[];
  themes: string[];
  description: string;
  pageCount?: number;
  publicationYear?: number;
  publisher?: string;
  publishedDate?: string;
  categories?: string[];
  coverUrl?: string;
  catalogSource?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  shelf: Shelf;
  userRating?: number;
  userNotes: string;
  dateRead?: string;
  isbn?: string;
  isbn13?: string;
  goodreadsId?: string;
  sourceLinks: SourceLink[];
  metadata: BookMetadata;
}

export interface ReadingPreferences {
  text: string;
  approvedInferences: string[];
}

export type RecommendationLane = "shelf" | "discovery";

export interface BookLinkTarget {
  title: string;
  author: string;
  localBookId?: string;
  isbn?: string;
  isbn13?: string;
  goodreadsId?: string;
  rationale?: string;
  caveats?: string[];
  sourceLinks: SourceLink[];
  metadata: BookMetadata;
}

export type AssistantMessageSegment =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "book-link";
      text: string;
      book: BookLinkTarget;
    };

export interface CatalogBookMetadata {
  title: string;
  author: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  coverUrl?: string;
  summary?: string;
  catalogSource: string;
}

export type SelectedBookRef =
  | {
      type: "local";
      bookId: string;
    }
  | {
      type: "recommendation";
      book: BookLinkTarget;
    };

export interface Recommendation {
  id: string;
  lane: RecommendationLane;
  title: string;
  author: string;
  rationale: string;
  matchNotes: string[];
  caveats: string[];
  linkedBookId?: string;
  sourceLinks: SourceLink[];
  metadata?: BookMetadata;
}

export interface PreferenceSuggestion {
  id: string;
  text: string;
  status: "pending" | "accepted" | "declined";
}

export type ChatMessage =
  | {
      id: string;
      role: "user";
      createdAt: string;
      text: string;
    }
  | {
      id: string;
      role: "assistant";
      createdAt: string;
      text: string;
      segments: AssistantMessageSegment[];
      preferenceSuggestions: PreferenceSuggestion[];
    };

export interface LegacyRecommendationRound {
  id: string;
  prompt: string;
  createdAt: string;
  recommendations: Recommendation[];
  assistantSummary: string;
  assistantMessage?: AssistantMessageSegment[];
  preferenceSuggestions: PreferenceSuggestion[];
}

export interface RecommendationSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface AiSettings {
  provider: "mock" | "openai-compatible";
  model: string;
  endpoint: string;
  apiKey: string;
}

export interface LinkSourceSetting {
  id: "goodreads" | "open-library" | "google-books" | "amazon";
  label: string;
  enabled: boolean;
  order: number;
}

export interface AppSettings {
  ai: AiSettings;
  linkSources: LinkSourceSetting[];
}

export interface AppState {
  books: Book[];
  sessions: RecommendationSession[];
  activeSessionId?: string;
  selectedBookId?: string;
  selectedBookRef?: SelectedBookRef;
  catalogCache?: Record<string, CatalogBookMetadata>;
  preferences: ReadingPreferences;
  settings: AppSettings;
}
