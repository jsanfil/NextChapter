import { createDefaultAppState } from "../domain/defaultState";
import type { AppState } from "../domain/types";

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

function isRecommendationDecision(value: unknown): value is AppState["sessions"][number]["rounds"][number]["recommendations"][number]["decision"] {
  return value === "undecided" || value === "accepted" || value === "rejected" || value === "shortlisted";
}

function isRecommendationLane(value: unknown): value is AppState["sessions"][number]["rounds"][number]["recommendations"][number]["lane"] {
  return value === "shelf" || value === "discovery";
}

function isPreferenceSuggestionStatus(value: unknown): value is AppState["sessions"][number]["rounds"][number]["preferenceSuggestions"][number]["status"] {
  return value === "pending" || value === "accepted" || value === "declined";
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
    isRecommendationDecision(value.decision) &&
    Array.isArray(value.sourceLinks) &&
    value.sourceLinks.every(isSourceLink)
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
    isObject(value.metadata) &&
    Array.isArray(value.metadata.genres) &&
    value.metadata.genres.every((genre) => typeof genre === "string") &&
    Array.isArray(value.metadata.themes) &&
    value.metadata.themes.every((theme) => typeof theme === "string") &&
    typeof value.metadata.description === "string" &&
    isOptionalNumber(value.metadata.pageCount) &&
    isOptionalNumber(value.metadata.publicationYear)
  );
}

function isSession(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.originalPrompt === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    Array.isArray(value.constraints) &&
    value.constraints.every((constraint) => typeof constraint === "string") &&
    Array.isArray(value.feedback) &&
    value.feedback.every((feedback) => typeof feedback === "string") &&
    Array.isArray(value.rounds) &&
    value.rounds.every(isRecommendationRound)
  );
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

function isAppState(value: unknown): value is AppState {
  if (
    !isObject(value) ||
    !Array.isArray(value.books) ||
    !Array.isArray(value.sessions) ||
    !isObject(value.preferences) ||
    !isObject(value.settings)
  ) {
    return false;
  }

  const { preferences, settings } = value;
  if (
    typeof preferences.text !== "string" ||
    !Array.isArray(preferences.approvedInferences) ||
    !isObject(settings.ai) ||
    !Array.isArray(settings.linkSources)
  ) {
    return false;
  }

  const { ai } = settings;
  return (
    isOptionalString(value.activeSessionId) &&
    isOptionalString(value.selectedBookId) &&
    value.books.every(isBook) &&
    value.sessions.every(isSession) &&
    preferences.approvedInferences.every((inference) => typeof inference === "string") &&
    settings.linkSources.every(isLinkSourceSetting) &&
    isAiProvider(ai.provider) &&
    typeof ai.model === "string" &&
    typeof ai.endpoint === "string" &&
    typeof ai.apiKey === "string"
  );
}

export function loadAppState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultAppState();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isAppState(parsed)) {
      return createDefaultAppState();
    }

    return parsed;
  } catch {
    return createDefaultAppState();
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
