import { createDefaultAppState } from "../domain/defaultState";
import { legacyRoundsToMessages } from "../domain/recommendationSessions";
import type { AppState, BookMetadata, LegacyRecommendationRound, RecommendationSession } from "../domain/types";

export const STORAGE_KEY = "nextchapter.appState.v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isOptionalNumber(value: unknown): boolean {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function isAiProvider(value: unknown): value is AppState["settings"]["ai"]["provider"] {
  return value === "mock" || value === "openai-compatible";
}

function isShelf(value: unknown): value is AppState["books"][number]["shelf"] {
  return value === "read" || value === "want-to-read" || value === "none";
}

function isLinkSourceId(value: unknown): value is AppState["settings"]["linkSources"][number]["id"] {
  return value === "goodreads" || value === "open-library" || value === "google-books" || value === "amazon";
}

function isSourceLink(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.url === "string" &&
    typeof value.enabled === "boolean"
  );
}

function isRecommendationLane(value: unknown): boolean {
  return value === "shelf" || value === "discovery";
}

function isPreferenceSuggestionStatus(value: unknown): boolean {
  return value === "pending" || value === "accepted" || value === "declined";
}

function isBookMetadata(value: unknown): value is BookMetadata {
  return (
    isObject(value) &&
    Array.isArray(value.genres) &&
    value.genres.every((genre) => typeof genre === "string") &&
    Array.isArray(value.themes) &&
    value.themes.every((theme) => typeof theme === "string") &&
    typeof value.description === "string" &&
    isOptionalNumber(value.pageCount) &&
    isOptionalNumber(value.publicationYear)
  );
}

function isRecommendation(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    isRecommendationLane(value.lane) &&
    typeof value.title === "string" &&
    typeof value.author === "string" &&
    typeof value.rationale === "string" &&
    Array.isArray(value.matchNotes) &&
    value.matchNotes.every((note) => typeof note === "string") &&
    Array.isArray(value.caveats) &&
    value.caveats.every((caveat) => typeof caveat === "string") &&
    isOptionalString(value.linkedBookId) &&
    Array.isArray(value.sourceLinks) &&
    value.sourceLinks.every(isSourceLink) &&
    (value.metadata === undefined || isBookMetadata(value.metadata))
  );
}

function isPreferenceSuggestion(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    isPreferenceSuggestionStatus(value.status)
  );
}

function isRecommendationRound(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.prompt === "string" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.recommendations) &&
    value.recommendations.every(isRecommendation) &&
    typeof value.assistantSummary === "string" &&
    Array.isArray(value.preferenceSuggestions) &&
    value.preferenceSuggestions.every(isPreferenceSuggestion)
  );
}

function isBookLinkTarget(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    typeof value.author === "string" &&
    isOptionalString(value.localBookId) &&
    isOptionalString(value.isbn) &&
    isOptionalString(value.isbn13) &&
    isOptionalString(value.goodreadsId) &&
    Array.isArray(value.sourceLinks) &&
    value.sourceLinks.every(isSourceLink) &&
    isBookMetadata(value.metadata)
  );
}

function isAssistantMessageSegment(value: unknown): boolean {
  if (!isObject(value) || typeof value.type !== "string" || typeof value.text !== "string") {
    return false;
  }

  return value.type === "text" || (value.type === "book-link" && isBookLinkTarget(value.book));
}

function isChatMessage(value: unknown): boolean {
  if (!isObject(value) || typeof value.id !== "string" || typeof value.createdAt !== "string" || typeof value.text !== "string") {
    return false;
  }

  if (value.role === "user") {
    return true;
  }

  return (
    value.role === "assistant" &&
    Array.isArray(value.segments) &&
    value.segments.every(isAssistantMessageSegment) &&
    Array.isArray(value.preferenceSuggestions) &&
    value.preferenceSuggestions.every(isPreferenceSuggestion)
  );
}

function isBook(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.author === "string" &&
    isShelf(value.shelf) &&
    isOptionalNumber(value.userRating) &&
    typeof value.userNotes === "string" &&
    isOptionalString(value.dateRead) &&
    isOptionalString(value.isbn) &&
    isOptionalString(value.isbn13) &&
    isOptionalString(value.goodreadsId) &&
    Array.isArray(value.sourceLinks) &&
    value.sourceLinks.every(isSourceLink) &&
    isBookMetadata(value.metadata)
  );
}

function normalizeSession(value: unknown): RecommendationSession | undefined {
  if (!isObject(value) || typeof value.id !== "string" || typeof value.title !== "string" || typeof value.createdAt !== "string") {
    return undefined;
  }

  const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : value.createdAt;
  if (Array.isArray(value.messages) && value.messages.every(isChatMessage)) {
    return {
      id: value.id,
      title: value.title,
      createdAt: value.createdAt,
      updatedAt,
      messages: value.messages as RecommendationSession["messages"]
    };
  }

  return (
    Array.isArray(value.rounds) &&
    value.rounds.every(isRecommendationRound)
  )
    ? {
        id: value.id,
        title: value.title,
        createdAt: value.createdAt,
        updatedAt,
        messages: legacyRoundsToMessages(value.rounds as LegacyRecommendationRound[])
      }
    : undefined;
}

function isLinkSourceSetting(value: unknown): boolean {
  return (
    isObject(value) &&
    isLinkSourceId(value.id) &&
    typeof value.label === "string" &&
    typeof value.enabled === "boolean" &&
    typeof value.order === "number"
  );
}

function normalizeAppState(value: unknown): AppState | undefined {
  if (
    !isObject(value) ||
    !Array.isArray(value.books) ||
    !Array.isArray(value.sessions) ||
    !isObject(value.preferences) ||
    !isObject(value.settings)
  ) {
    return undefined;
  }

  const { preferences, settings } = value;
  if (
    typeof preferences.text !== "string" ||
    !Array.isArray(preferences.approvedInferences) ||
    !isObject(settings.ai) ||
    !Array.isArray(settings.linkSources)
  ) {
    return undefined;
  }

  const { ai } = settings;
  if (
    isOptionalString(value.activeSessionId) &&
    isOptionalString(value.selectedBookId) &&
    value.books.every(isBook) &&
    value.sessions.every((session) => normalizeSession(session) !== undefined) &&
    preferences.approvedInferences.every((inference) => typeof inference === "string") &&
    settings.linkSources.every(isLinkSourceSetting) &&
    isAiProvider(ai.provider) &&
    typeof ai.model === "string" &&
    typeof ai.endpoint === "string" &&
    typeof ai.apiKey === "string"
  ) {
    const activeSessionId = value.activeSessionId as string | undefined;
    const selectedBookId = value.selectedBookId as string | undefined;
    const typedPreferences: AppState["preferences"] = {
      text: preferences.text,
      approvedInferences: preferences.approvedInferences
    };
    const typedSettings: AppState["settings"] = {
      ai: {
        provider: ai.provider,
        model: ai.model,
        endpoint: ai.endpoint,
        apiKey: ai.apiKey
      },
      linkSources: settings.linkSources as AppState["settings"]["linkSources"]
    };

    return {
      books: value.books,
      sessions: value.sessions.map((session) => normalizeSession(session)).filter(Boolean) as RecommendationSession[],
      activeSessionId,
      selectedBookId,
      preferences: typedPreferences,
      settings: typedSettings,
      catalogCache: isObject(value.catalogCache) ? (value.catalogCache as AppState["catalogCache"]) : {}
    };
  }

  return undefined;
}

export function loadAppState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultAppState();
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = normalizeAppState(parsed);
    if (!normalized) {
      return createDefaultAppState();
    }

    return normalized;
  } catch {
    return createDefaultAppState();
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
