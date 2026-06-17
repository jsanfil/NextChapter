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
export type RecommendationDecision = "undecided" | "accepted" | "rejected" | "shortlisted";

export interface Recommendation {
  id: string;
  lane: RecommendationLane;
  title: string;
  author: string;
  rationale: string;
  matchNotes: string[];
  caveats: string[];
  linkedBookId?: string;
  decision: RecommendationDecision;
  sourceLinks: SourceLink[];
}

export interface PreferenceSuggestion {
  id: string;
  text: string;
  status: "pending" | "accepted" | "declined";
}

export interface RecommendationRound {
  id: string;
  prompt: string;
  createdAt: string;
  recommendations: Recommendation[];
  assistantSummary: string;
  preferenceSuggestions: PreferenceSuggestion[];
}

export interface RecommendationSession {
  id: string;
  title: string;
  originalPrompt: string;
  createdAt: string;
  updatedAt: string;
  constraints: string[];
  feedback: string[];
  rounds: RecommendationRound[];
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
  preferences: ReadingPreferences;
  settings: AppSettings;
}
