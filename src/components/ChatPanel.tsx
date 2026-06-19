import { useEffect, useRef, useState } from "react";
import type { AssistantMessageSegment, BookLinkTarget, RecommendationSession } from "../domain/types";

interface ChatPanelProps {
  activeSession?: RecommendationSession;
  isLoading: boolean;
  error: string;
  status: string;
  onSubmitPrompt: (prompt: string) => void;
  onNewChat: () => void;
  onSaveChat: () => void;
  onSelectBookLink: (book: BookLinkTarget) => void;
  onResolvePreferenceSuggestion: (suggestionId: string, status: "accepted" | "declined") => void;
}

const SUGGESTION_PROMPTS = [
  "Something quiet and literary for a slow weekend",
  "A novel like Station Eleven — world-ending but hopeful",
  "Recommend from my want-to-read shelf based on what I've loved",
];

export default function ChatPanel({
  activeSession,
  isLoading,
  error,
  status,
  onSubmitPrompt,
  onNewChat,
  onSaveChat,
  onSelectBookLink,
  onResolvePreferenceSuggestion,
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = activeSession?.messages || [];
  const pendingSuggestions = messages.flatMap((message) =>
    message.role === "assistant"
      ? message.preferenceSuggestions.filter((s) => s.status === "pending")
      : []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleSubmit(text?: string) {
    const trimmed = (text ?? prompt).trim();
    if (!trimmed) return;
    onSubmitPrompt(trimmed);
    setPrompt("");
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <section
      className="flex flex-col h-screen bg-[--color-parchment]"
      aria-label="Recommendation chat"
    >
      {/* ── Header ── */}
      <header className="flex items-start justify-between px-8 pt-8 pb-6 shrink-0">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.1em] text-[--color-amber] mb-1"
            aria-hidden="true"
          >
            Personal reading advisor
          </p>
          <h1 className="font-serif text-[1.75rem] font-semibold text-[--color-ink] leading-tight m-0">
            NextChapter
          </h1>
          {activeSession ? (
            <p className="mt-1 text-sm text-[--color-ink-muted] font-medium truncate max-w-xs">
              {activeSession.title}
            </p>
          ) : null}
        </div>

        <div className="flex gap-1.5 mt-1 shrink-0">
          <button
            type="button"
            onClick={onSaveChat}
            disabled={!activeSession}
            className="text-sm px-4 py-1.5 rounded-full text-[--color-ink] bg-[--color-ghost-btn] shadow-sm hover:bg-[--color-border-mid] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onNewChat}
            className="text-sm px-4 py-1.5 rounded-full text-[--color-ink] bg-[--color-ghost-btn] shadow-sm hover:bg-[--color-border-mid] transition-colors"
          >
            New chat
          </button>
        </div>
      </header>

      {/* ── Message list ── */}
      <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6" aria-label="Conversation">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleSubmit} />
        ) : (
          <>
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-sm bg-[--color-ghost-btn] rounded-2xl px-4 py-3 text-[--color-ink] text-sm leading-relaxed m-0">
                    {message.text}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="max-w-[42rem]">
                  <AssistantMessage
                    segments={message.segments}
                    onSelectBookLink={onSelectBookLink}
                  />
                </div>
              )
            )}

            {pendingSuggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="max-w-[42rem] bg-[--color-amber-bg] rounded-2xl px-5 py-4"
              >
                <p className="text-sm text-[--color-ink] leading-relaxed m-0 mb-3">{suggestion.text}</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onResolvePreferenceSuggestion(suggestion.id, "accepted")}
                    className="text-xs px-4 py-1.5 rounded-full bg-[--color-espresso] text-[--color-parchment] hover:bg-[--color-espresso-hover] transition-colors"
                  >
                    Save preference
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolvePreferenceSuggestion(suggestion.id, "declined")}
                    className="text-xs px-4 py-1.5 rounded-full bg-[--color-ghost-btn] shadow-sm text-[--color-ink] hover:bg-[--color-border-mid] transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))}

            {isLoading ? (
              <div className="max-w-[42rem]">
                <ThinkingIndicator />
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-[--color-error] font-medium">{error}</p>
            ) : null}
            {status && !error ? (
              <p className="text-sm text-[--color-green] font-medium">{status}</p>
            ) : null}
          </>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ── Prompt form ── */}
      <div className="shrink-0 px-8 pb-8 pt-4">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <label htmlFor="recommendation-prompt" className="sr-only">
            Ask for book recommendations
          </label>
          <textarea
            ref={textareaRef}
            id="recommendation-prompt"
            name="prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What are you in the mood to read?"
            className="w-full resize-none rounded-2xl px-5 pt-4 pb-12 text-sm leading-relaxed text-[--color-ink] placeholder:text-[--color-ink-light] focus:outline-none"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
            <span className="text-xs text-[--color-ink-light]">
              {typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl"}+↵
            </span>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="pointer-events-auto px-4 py-1.5 rounded-full bg-[--color-espresso] text-[--color-parchment] text-sm font-medium hover:bg-[--color-espresso-hover] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "Thinking…" : "Ask"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ── Empty state ── */
function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-8 pt-4">
      <div>
        <p className="font-serif text-xl text-[--color-ink] leading-relaxed mb-1">
          What would you like to read next?
        </p>
        <p className="text-sm text-[--color-ink-muted] leading-relaxed max-w-md">
          Describe a mood, genre, theme, or reading goal. I&apos;ll search your library and suggest what fits.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[--color-tan] mb-1">
          A few ways to start
        </p>
        {SUGGESTION_PROMPTS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSuggestionClick(text)}
            className="text-left text-sm text-[--color-ink] rounded-2xl px-4 py-3 bg-[--color-ghost-btn] shadow-sm hover:bg-[--color-border-mid] transition-colors"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Thinking indicator ── */
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-[--color-ink-muted]" aria-live="polite" aria-label="Thinking">
      <span className="inline-flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[--color-tan] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span>Thinking&hellip;</span>
    </div>
  );
}

/* ── Assistant message ── */
function AssistantMessage({
  segments,
  onSelectBookLink,
}: {
  segments: AssistantMessageSegment[];
  onSelectBookLink: (book: BookLinkTarget) => void;
}) {
  return (
    <p className="font-serif text-[--color-ink] text-base leading-[1.75] m-0">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`${index}-${segment.text}`}>{segment.text}</span>;
        }

        return (
          <button
            key={`${index}-${segment.book.title}`}
            type="button"
            onClick={() => onSelectBookLink(segment.book)}
            aria-label={`Open details for ${segment.book.title} by ${segment.book.author}`}
            className="inline font-semibold text-[--color-green] underline underline-offset-2 decoration-[--color-green]/40 hover:text-[--color-green-hover] hover:decoration-[--color-green-hover]/60 transition-colors border-0 bg-transparent p-0 cursor-pointer"
          >
            {segment.text}
          </button>
        );
      })}
    </p>
  );
}
