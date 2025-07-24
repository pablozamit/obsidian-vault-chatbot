import { api } from "encore.dev/api";
import {
  SearchNotesRequest,
  SearchNotesResponse,
  SearchResult,
} from "./types";
import { getPineconeClient } from "./pinecone";
import { getEmbeddings } from "./ai";

/**
 * Realiza búsqueda semántica en el índice de Pinecone y devuelve
 * las notas más relevantes según el umbral indicado.
 */
export const search = api<SearchNotesRequest, SearchNotesResponse>(
  { expose: true, method: "POST", path: "/notes/search" },
  async (req) => {
    //------------------------------------------------------------------
    // 1) Parámetros de búsqueda con valores por defecto
    //------------------------------------------------------------------
    const topK = req.limit ?? 10;          // máximo de coincidencias
    const threshold = req.threshold ?? 0;  // puntuación mínima

    //------------------------------------------------------------------
    // 2) Conexión a Pinecone
    //------------------------------------------------------------------
    const { index } = await getPineconeClient();

    //------------------------------------------------------------------
    // 3) Embedding de la consulta con el modelo “embedding‑001”
    //------------------------------------------------------------------
    const queryEmbedding = await getEmbeddings(req.query);

    //------------------------------------------------------------------
    // 4) Consulta al índice
    //------------------------------------------------------------------
    const { matches } = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    //------------------------------------------------------------------
    // 5) Conversión de resultados → nuestro tipo SearchResult
    //------------------------------------------------------------------
    const results: SearchResult[] = (matches ?? [])
      .filter((m) => (m.score ?? 0) >= threshold)
      .map((m) => ({
        // ID puede incluir guiones/barras bajas, así que lo dejamos como string
        id: m.id,
        title: (m.metadata?.source as string) ?? "",
        path: (m.metadata?.source as string) ?? "",
        content: (m.metadata?.text as string) ?? "",
        similarity: m.score ?? 0,
        // Si añadiste otros metadatos (p. ej. updated_at) inclúyelos aquí
        updated_at: m.metadata?.updated_at as number | undefined,
      }));

    return { results };
  }
);
