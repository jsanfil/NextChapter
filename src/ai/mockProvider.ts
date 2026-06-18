import { buildSourceLinks } from "../domain/externalLinks";
import { createId } from "../domain/ids";
import type { RecommendationProvider, RecommendationResponse } from "./types";

export function createMockRecommendationProvider(): RecommendationProvider {
  return {
    async recommend(request): Promise<RecommendationResponse> {
      const shelfRecommendations = request.context.wantToReadBooks.slice(0, 3).map((book) => ({
        id: createId("rec"),
        lane: "shelf" as const,
        title: book.title,
        author: book.author,
        rationale: `This is already on your want-to-read shelf and matches the request for ${request.context.prompt}.`,
        matchNotes: [
          request.context.preferenceText,
          book.metadata.genres.length > 0 ? `Known genres: ${book.metadata.genres.join(", ")}.` : "Shelf match from your library."
        ].filter(Boolean),
        caveats: book.metadata.description ? [] : ["Metadata is limited, so this match leans on shelf and title context."],
        linkedBookId: book.id,
        decision: "undecided" as const,
        sourceLinks: book.sourceLinks.length > 0 ? book.sourceLinks : buildSourceLinks(book, request.linkSources)
      }));

      const discoveries = [
        {
          title: "Severance",
          author: "Ling Ma",
          rationale: "A sharp, literary post-collapse novel with a lighter satirical edge than many survival stories.",
          matchNotes: ["Fits reflective speculative fiction and mood-aware post-apocalyptic prompts."],
          caveats: ["Its workplace satire may feel more surreal than traditional genre fiction."]
        },
        {
          title: "A Psalm for the Wild-Built",
          author: "Becky Chambers",
          rationale: "A gentle, hopeful speculative pick when the prompt asks for something lighter.",
          matchNotes: ["Useful when you ask for softer tone, warmth, or a quick read."],
          caveats: ["Less post-apocalyptic than post-scarcity and philosophical."]
        }
      ].map((book) => ({
        id: createId("rec"),
        lane: "discovery" as const,
        title: book.title,
        author: book.author,
        rationale: book.rationale,
        matchNotes: book.matchNotes,
        caveats: book.caveats,
        decision: "undecided" as const,
        sourceLinks: buildSourceLinks(book, request.linkSources)
      }));

      return {
        assistantSummary: `Here are a few explainable matches for "${request.context.prompt}", split between your shelf and new discoveries.`,
        recommendations: [...shelfRecommendations, ...discoveries],
        preferenceSuggestions: request.context.prompt.toLowerCase().includes("not too bleak")
          ? [
              {
                id: createId("pref"),
                text: "When asking for post-apocalyptic fiction, prefer reflective books that are not relentlessly bleak.",
                status: "pending"
              }
            ]
          : []
      };
    }
  };
}
