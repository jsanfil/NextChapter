import type { AssistantMessageSegment, LinkSourceSetting, PreferenceSuggestion, Recommendation } from "../domain/types";
import type { RecommendationContext } from "../domain/recommendationContext";

export interface RecommendationRequest {
  context: RecommendationContext;
  linkSources: LinkSourceSetting[];
}

export interface RecommendationResponse {
  assistantSummary: string;
  assistantMessage: AssistantMessageSegment[];
  recommendations: Recommendation[];
  preferenceSuggestions: PreferenceSuggestion[];
}

export interface RecommendationProvider {
  recommend(request: RecommendationRequest): Promise<RecommendationResponse>;
}
