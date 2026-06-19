import { buildSourceLinks } from "../domain/externalLinks";
import { createId } from "../domain/ids";
import type { AssistantMessageSegment, Recommendation } from "../domain/types";
import type { RecommendationProvider, RecommendationResponse } from "./types";

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

function buildAssistantMessage(prompt: string, recommendations: Recommendation[]): AssistantMessageSegment[] {
  const [first, second, third] = recommendations;
  const segments: AssistantMessageSegment[] = [
    {
      type: "text",
      text: `I took a look through your imported library and the current mood: "${prompt}". You seem to be asking for something imaginative, propulsive, and a little off the obvious path.\n\nIf I were picking one book for you right now, I would start with `
    }
  ];

  if (first) {
    segments.push(recommendationToBookLink(first));
    segments.push({ type: "text", text: ` — ${first.rationale}\n\nA few more strong options:\n\n` });
  }

  [second, third].filter(Boolean).forEach((recommendation, index) => {
    segments.push({ type: "text", text: `${index + 1}. ` });
    segments.push(recommendationToBookLink(recommendation));
    segments.push({ type: "text", text: ` — ${recommendation.rationale}\n` });
  });

  segments.push({
    type: "text",
    text: "\nClick any title and I’ll show the metadata, shelf status, summary, and source links in the book inspector."
  });

  return segments;
}

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
        sourceLinks: book.sourceLinks.length > 0 ? book.sourceLinks : buildSourceLinks(book, request.linkSources),
        metadata: book.metadata
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
        sourceLinks: buildSourceLinks(book, request.linkSources),
        metadata: {
          genres: [],
          themes: book.matchNotes,
          description: book.rationale
        }
      }));

      const recommendations = [...shelfRecommendations, ...discoveries];

      return {
        assistantSummary: `Here are a few explainable matches for "${request.context.prompt}", with linked titles you can inspect.`,
        assistantMessage: buildAssistantMessage(request.context.prompt, recommendations),
        recommendations,
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
