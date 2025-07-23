import { api } from "encore.dev/api";
import { SearchNotesRequest, SearchNotesResponse } from "./types";
// CORRECCIÓN: Rutas de importación relativas y sin extensión
import { getPineconeClient } from "../pinecone";
import { getEmbeddings } from "../ai";

export const search = api<SearchNotesRequest, SearchNotesResponse>(
  { expose: true, method: "POST", path: "/notes/search" },
  async (req) => {
    const pinecone = await getPineconeClient();
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    const queryEmbedding = await getEmbeddings(req.query);

    const searchResults = await index.query({
      topK: req.limit || 10,
      vector: queryEmbedding,
      includeMetadata: true,
    });

    return {
      results: searchResults.matches.map((match) => ({
        id: match.id,
        title: match.metadata?.title as string,
        path: match.metadata?.path as string,
        content: match.metadata?.content as string,
        updated_at: match.metadata?.updated_at as number,
        score: match.score,
      })),
    };
  }
);
