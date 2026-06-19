import { useEffect, useMemo, useState } from "react";
import { createMockRecommendationProvider } from "./ai/mockProvider";
import { createOpenAiCompatibleProvider } from "./ai/openAiCompatibleProvider";
import BookDetailPanel from "./components/BookDetailPanel";
import CanvasTabs, { type CanvasTab } from "./components/CanvasTabs";
import ChatPanel from "./components/ChatPanel";
import LibraryView from "./components/LibraryView";
import RecommendationSessionsView from "./components/RecommendationSessionsView";
import SettingsView from "./components/SettingsView";
import { catalogCacheKey, fetchCatalogMetadata } from "./domain/bookCatalog";
import { buildSourceLinks } from "./domain/externalLinks";
import { buildRecommendationContext } from "./domain/recommendationContext";
import {
  appendChatExchange,
  createRecommendationSession,
  resolvePreferenceSuggestion
} from "./domain/recommendationSessions";
import type { AppState, Book, BookLinkTarget, Recommendation, RecommendationSession, SelectedBookRef } from "./domain/types";
import { loadAppState, saveAppState } from "./storage/localRepository";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<CanvasTab>("detail");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const activeSession = useMemo(
    () => state.sessions.find((session) => session.id === state.activeSessionId),
    [state.activeSessionId, state.sessions]
  );
  const selectedBook = useMemo(
    () => resolveSelectedBook(state.selectedBookRef, state.books),
    [state.books, state.selectedBookRef]
  );
  const selectedBookTarget = useMemo(
    () => (selectedBook ? toBookLinkTarget(selectedBook, state.settings.linkSources) : undefined),
    [selectedBook, state.settings.linkSources]
  );
  const selectedCatalogKey = selectedBookTarget ? catalogCacheKey(selectedBookTarget) : undefined;
  const selectedCatalog = selectedCatalogKey ? state.catalogCache?.[selectedCatalogKey] : undefined;

  useEffect(() => {
    if (!selectedBookTarget || !selectedCatalogKey || selectedCatalog) {
      return;
    }

    let cancelled = false;
    setIsLoadingCatalog(true);
    fetchCatalogMetadata(selectedBookTarget)
      .then((catalog) => {
        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          catalogCache: {
            ...(current.catalogCache || {}),
            [selectedCatalogKey]: catalog
          }
        }));
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCatalog(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBookTarget, selectedCatalogKey, selectedCatalog]);

  async function submitPrompt(prompt: string) {
    setIsLoading(true);
    setError("");
    setStatus("");

    try {
      const session = activeSession || createRecommendationSession(prompt);
      const context = buildRecommendationContext({
        prompt,
        books: state.books,
        preferences: state.preferences,
        activeSession: session
      });
      const provider =
        state.settings.ai.provider === "openai-compatible"
          ? createOpenAiCompatibleProvider(state.settings.ai)
          : createMockRecommendationProvider();
      const response = await provider.recommend({
        context,
        linkSources: state.settings.linkSources
      });
      const updatedSession = appendChatExchange(session, {
        prompt,
        assistantSummary: response.assistantSummary,
        assistantMessage: response.assistantMessage,
        preferenceSuggestions: response.preferenceSuggestions
      });
      const firstTarget = firstRecommendationTarget(response.recommendations);

      setState((current) => ({
        ...current,
        activeSessionId: updatedSession.id,
        selectedBookRef: firstTarget ? resolveBookRef(firstTarget, current.books) : current.selectedBookRef,
        sessions: upsertSession(current.sessions, updatedSession)
      }));
      setActiveTab("detail");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Recommendation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function selectBookLink(book: BookLinkTarget) {
    setState((current) => ({
      ...current,
      selectedBookId: book.localBookId,
      selectedBookRef: resolveBookRef(book, current.books)
    }));
    setActiveTab("detail");
  }

  function saveCurrentChat() {
    if (!activeSession) {
      return;
    }

    saveAppState(state);
    setStatus("Chat saved.");
  }

  function startNewChat() {
    setState((current) => ({
      ...current,
      activeSessionId: undefined,
      selectedBookId: undefined,
      selectedBookRef: undefined
    }));
    setError("");
    setStatus("Started a new chat.");
    setActiveTab("detail");
  }

  function resolveSuggestion(suggestionId: string, status: "accepted" | "declined") {
    if (!activeSession) {
      return;
    }

    const updated = resolvePreferenceSuggestion(activeSession, suggestionId, status);
    const acceptedSuggestion = activeSession.messages
      .flatMap((message) => (message.role === "assistant" ? message.preferenceSuggestions : []))
      .find((suggestion) => suggestion.id === suggestionId);

    setState((current) => ({
      ...current,
      sessions: upsertSession(current.sessions, updated),
      preferences:
        status === "accepted" && acceptedSuggestion
          ? {
              ...current.preferences,
              approvedInferences: [...current.preferences.approvedInferences, acceptedSuggestion.text]
            }
          : current.preferences
    }));
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[--color-cream]" style={{ gridTemplateColumns: "unset" }}>
      {/* ── Left: Chat column ── */}
      <div className="flex-[1.18] min-w-[380px] max-w-[680px] flex flex-col h-screen overflow-hidden">
        <ChatPanel
          activeSession={activeSession}
          isLoading={isLoading}
          error={error}
          status={status}
          onSubmitPrompt={submitPrompt}
          onNewChat={startNewChat}
          onSaveChat={saveCurrentChat}
          onSelectBookLink={selectBookLink}
          onResolvePreferenceSuggestion={resolveSuggestion}
        />
      </div>

      {/* ── Right: Inspector column ── */}
      <section
        className="flex-[0.82] min-w-[320px] flex flex-col h-screen overflow-hidden bg-[--color-panel]"
        aria-label="Library canvas"
      >
        <CanvasTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex-1 overflow-y-auto">
          {activeTab === "library" ? (
            <LibraryView
              books={state.books}
              linkSources={state.settings.linkSources}
              onBooksChange={(books) => setState((current) => ({ ...current, books }))}
              onSelectBook={(bookId) => {
                setState((current) => ({
                  ...current,
                  selectedBookId: bookId,
                  selectedBookRef: { type: "local", bookId },
                }));
                setActiveTab("detail");
              }}
            />
          ) : (
            <>
              {activeTab === "sessions" ? (
                <RecommendationSessionsView
                  sessions={state.sessions}
                  activeSessionId={state.activeSessionId}
                  onSelectSession={(sessionId) => {
                    const session = state.sessions.find((candidate) => candidate.id === sessionId);
                    const firstBookLink = firstBookLinkFromSession(session);
                    setState((current) => ({
                      ...current,
                      activeSessionId: sessionId,
                      selectedBookId: undefined,
                      selectedBookRef: firstBookLink
                        ? resolveBookRef(firstBookLink, current.books)
                        : undefined,
                    }));
                    setStatus(session ? `Resumed chat: ${session.title}` : "");
                    setActiveTab("detail");
                  }}
                />
              ) : null}
              {activeTab === "detail" ? (
                <BookDetailPanel
                  book={selectedBook}
                  catalog={selectedCatalog}
                  isLoadingCatalog={isLoadingCatalog}
                />
              ) : null}
              {activeTab === "settings" ? (
                <SettingsView
                  preferences={state.preferences}
                  settings={state.settings}
                  onPreferencesChange={(preferences) =>
                    setState((current) => ({ ...current, preferences }))
                  }
                  onSettingsChange={(settings) =>
                    setState((current) => ({ ...current, settings }))
                  }
                />
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function upsertSession(sessions: RecommendationSession[], session: RecommendationSession): RecommendationSession[] {
  const exists = sessions.some((candidate) => candidate.id === session.id);
  return exists
    ? sessions.map((candidate) => (candidate.id === session.id ? session : candidate))
    : [session, ...sessions];
}

function firstRecommendationTarget(recommendations: Recommendation[]): BookLinkTarget | undefined {
  const recommendation = recommendations[0];
  if (!recommendation) {
    return undefined;
  }

  return {
    title: recommendation.title,
    author: recommendation.author,
    localBookId: recommendation.linkedBookId,
    sourceLinks: recommendation.sourceLinks,
    rationale: recommendation.rationale,
    caveats: recommendation.caveats,
    metadata:
      recommendation.metadata ?? {
        genres: [],
        themes: recommendation.matchNotes,
        description: recommendation.rationale
      }
  };
}

function firstBookLinkFromSession(session: RecommendationSession | undefined): BookLinkTarget | undefined {
  return session?.messages
    .flatMap((message) => (message.role === "assistant" ? message.segments : []))
    .find((segment) => segment.type === "book-link")?.book;
}

function toBookLinkTarget(book: Book | BookLinkTarget, linkSources: AppState["settings"]["linkSources"]): BookLinkTarget {
  if ("id" in book && "shelf" in book) {
    return {
      title: book.title,
      author: book.author,
      localBookId: book.id,
      isbn: book.isbn,
      isbn13: book.isbn13,
      goodreadsId: book.goodreadsId,
      sourceLinks: book.sourceLinks.length > 0 ? book.sourceLinks : buildSourceLinks(book, linkSources),
      metadata: book.metadata
    };
  }

  return {
    ...book,
    sourceLinks: book.sourceLinks.length > 0 ? book.sourceLinks : buildSourceLinks(book, linkSources)
  };
}

function resolveBookRef(target: BookLinkTarget, books: Book[]): SelectedBookRef {
  const matched = findMatchingBook(target, books);
  return matched ? { type: "local", bookId: matched.id } : { type: "recommendation", book: target };
}

function resolveSelectedBook(ref: SelectedBookRef | undefined, books: Book[]): Book | BookLinkTarget | undefined {
  if (!ref) {
    return undefined;
  }

  if (ref.type === "local") {
    return books.find((book) => book.id === ref.bookId);
  }

  return ref.book;
}

function findMatchingBook(target: BookLinkTarget, books: Book[]): Book | undefined {
  if (target.localBookId) {
    const byId = books.find((book) => book.id === target.localBookId);
    if (byId) {
      return byId;
    }
  }

  const targetIsbn = target.isbn13 ?? target.isbn;
  if (targetIsbn) {
    const byIsbn = books.find((book) => book.isbn13 === targetIsbn || book.isbn === targetIsbn);
    if (byIsbn) {
      return byIsbn;
    }
  }

  const title = target.title.trim().toLowerCase();
  const author = target.author.trim().toLowerCase();
  return books.find((book) => book.title.trim().toLowerCase() === title && book.author.trim().toLowerCase() === author);
}


