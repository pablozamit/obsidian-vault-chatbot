import { generateEmbedding } from "./embedding";
import { Pinecone } from '@pinecone-database/pinecone';
import { secret } from "encore.dev/config";

const pineconeKey = secret("PineconeAPIKey");
const pineconeIndex = secret("PineconeIndexName");

const pc = new Pinecone({
  apiKey: pineconeKey()
});

export const search = api<SearchNotesRequest, SearchNotesResponse>(
  { expose: true, method: "POST", path: "/notes/search" },
  async (req) => {
    const limit = req.limit || 10;
    
    // Generar embedding para la consulta
    const queryEmbedding = await generateEmbedding(req.query);
    
    // Buscar en Pinecone
    const index = pc.index(pineconeIndex());
    const results = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true
    });
    
    // Mapear resultados
    return {
      results: results.matches.map(match => ({
        id: parseInt(match.id),
        title: match.metadata?.title as string,
        path: match.metadata?.path as string,
        content: match.metadata?.content as string,
        similarity: match.score || 0
      }))
    };
  }
);
