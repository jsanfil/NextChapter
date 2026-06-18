import { createId } from "./ids";
import type {
  PreferenceSuggestion,
  Recommendation,
  RecommendationDecision,
  RecommendationRound,
  RecommendationSession
} from "./types";

function now(): string {
  return new Date().toISOString();
}

function titleFromPrompt(prompt: string): string {
  return prompt.trim().slice(0, 72) || "Recommendation session";
}

export function createRecommendationSession(prompt: string): RecommendationSession {
  const createdAt = now();

  return {
    id: createId("session"),
    title: titleFromPrompt(prompt),
    originalPrompt: prompt.trim(),
    createdAt,
    updatedAt: createdAt,
    constraints: [],
    feedback: [],
    rounds: []
  };
}

interface AppendRoundInput {
  prompt: string;
  recommendations: Recommendation[];
  assistantSummary: string;
  preferenceSuggestions: PreferenceSuggestion[];
}

export function appendRecommendationRound(
  session: RecommendationSession,
  input: AppendRoundInput
): RecommendationSession {
  const timestamp = now();
  const round: RecommendationRound = {
    id: createId("round"),
    prompt: input.prompt.trim(),
    createdAt: timestamp,
    recommendations: input.recommendations,
    assistantSummary: input.assistantSummary,
    preferenceSuggestions: input.preferenceSuggestions
  };

  return {
    ...session,
    updatedAt: timestamp,
    feedback: session.rounds.length > 0 ? [...session.feedback, input.prompt.trim()] : session.feedback,
    rounds: [...session.rounds, round]
  };
}

export function decideRecommendation(
  session: RecommendationSession,
  recommendationId: string,
  decision: RecommendationDecision
): RecommendationSession {
  return {
    ...session,
    updatedAt: now(),
    rounds: session.rounds.map((round) => ({
      ...round,
      recommendations: round.recommendations.map((recommendation) =>
        recommendation.id === recommendationId ? { ...recommendation, decision } : recommendation
      )
    }))
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
    rounds: session.rounds.map((round) => ({
      ...round,
      preferenceSuggestions: round.preferenceSuggestions.map((suggestion) =>
        suggestion.id === suggestionId ? { ...suggestion, status } : suggestion
      )
    }))
  };
}
