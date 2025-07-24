import { api } from "encore.dev/api";
import { SearchNotesRequest, SearchNotesResponse, SearchResult } from "./types";
import { getPineconeClient } from "./pinecone";
import { getEmbeddings } from "./ai";

export const search = api<SearchNotesRequest, SearchNotesResponse>(
  { expose: true, method: "POST", path: "/notes/search" },
  async (req) => {
    const { index } = await getPineconeClient();
    const queryEmbedding = await getEmbeddings(req.query);

    const searchResults = await index.query({
      topK: req.limit || 10,
      vector: queryEmbedding,
      includeMetadata: true,
    });

    const results: SearchResult[] = searchResults.matches
      .filter(match => (match.score || 0) >= (req.threshold || 0))
      .map((match: any) => ({
        id: parseInt(match.id, 10),
        title: match.metadata?.title as string,
        path: match.metadata?.path as string,
        content: match.metadata?.content as string,
        similarity: match.score,
        updated_at: match.metadata?.updated_at as number,
      }));

    return {
      results,
    };
  }
);
