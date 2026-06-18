import type { AiSettings } from "../domain/types";
import type { RecommendationProvider, RecommendationRequest, RecommendationResponse } from "./types";

function systemPrompt(): string {
  return [
    "You are NextChapter, a personal book recommendation assistant.",
    "Return only JSON with assistantSummary, recommendations, and preferenceSuggestions.",
    "Recommendations must include lane, title, author, rationale, matchNotes, caveats, decision, and sourceLinks.",
    "Separate user facts from inferences and include caveats when confidence is limited."
  ].join("\n");
}

export function createOpenAiCompatibleProvider(settings: AiSettings): RecommendationProvider {
  return {
    async recommend(request: RecommendationRequest): Promise<RecommendationResponse> {
      if (!settings.apiKey.trim()) {
        throw new Error("Missing API key for the configured AI provider.");
      }

      const response = await fetch(settings.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt() },
            { role: "user", content: JSON.stringify(request) }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`AI provider request failed with status ${response.status}.`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        throw new Error("AI provider returned an unreadable response.");
      }

      return JSON.parse(content) as RecommendationResponse;
    }
  };
}
