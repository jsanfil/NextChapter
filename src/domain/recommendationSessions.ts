import { createId } from "./ids";
import type {
  AssistantMessageSegment,
  ChatMessage,
  LegacyRecommendationRound,
  PreferenceSuggestion,
  Recommendation,
  RecommendationSession
} from "./types";

function now(): string {
  return new Date().toISOString();
}

function titleFromPrompt(prompt: string): string {
  return prompt.trim().slice(0, 72) || "Recommendation session";
}

function recommendationToBookLink(recommendation: Recommendation): AssistantMessageSegment {
  return {
    type: "book-link",
    text: recommendation.title,
    book: {
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
    }
  };
}

export function createRecommendationSession(prompt: string): RecommendationSession {
  const createdAt = now();

  return {
    id: createId("session"),
    title: titleFromPrompt(prompt),
    createdAt,
    updatedAt: createdAt,
    messages: []
  };
}

interface AppendChatExchangeInput {
  prompt: string;
  assistantSummary: string;
  assistantMessage?: AssistantMessageSegment[];
  preferenceSuggestions: PreferenceSuggestion[];
}

export function appendChatExchange(
  session: RecommendationSession,
  input: AppendChatExchangeInput
): RecommendationSession {
  const timestamp = now();
  const userMessage: ChatMessage = {
    id: createId("msg"),
    role: "user",
    createdAt: timestamp,
    text: input.prompt.trim()
  };
  const assistantMessage: ChatMessage = {
    id: createId("msg"),
    role: "assistant",
    createdAt: timestamp,
    text: input.assistantSummary,
    segments: input.assistantMessage ?? [{ type: "text", text: input.assistantSummary }],
    preferenceSuggestions: input.preferenceSuggestions
  };

  return {
    ...session,
    updatedAt: timestamp,
    messages: [...session.messages, userMessage, assistantMessage]
  };
}

export function resolvePreferenceSuggestion(
  session: RecommendationSession,
  suggestionId: string,
  status: "accepted" | "declined"
): RecommendationSession {
  return {
    ...session,
    updatedAt: now(),
    messages: session.messages.map((message) => {
      if (message.role !== "assistant") {
        return message;
      }

      return {
        ...message,
        preferenceSuggestions: message.preferenceSuggestions.map((suggestion) =>
          suggestion.id === suggestionId ? { ...suggestion, status } : suggestion
        )
      };
    })
  };
}

export function legacyRoundsToMessages(rounds: LegacyRecommendationRound[]): ChatMessage[] {
  return rounds.flatMap((round) => {
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      createdAt: round.createdAt,
      text: round.prompt
    };
    const assistantSegments =
      round.assistantMessage ??
      (round.recommendations.length > 0
        ? round.recommendations.map(recommendationToBookLink)
        : [{ type: "text" as const, text: round.assistantSummary }]);
    const assistantMessage: ChatMessage = {
      id: createId("msg"),
      role: "assistant",
      createdAt: round.createdAt,
      text: round.assistantSummary,
      segments: assistantSegments,
      preferenceSuggestions: round.preferenceSuggestions
    };

    return [userMessage, assistantMessage];
  });
}
