// backend/notes/upload.ts
import { api } from "encore.dev/api";
import { UploadNotesRequest, UploadNotesResponse } from "./types";
import { getPineconeClient } from "../pinecone"; // Importación corregida
import { getEmbeddings } from "./ai"; // CAMBIADO: de "../ai" a "./ai"
import db from "../external_dbs/postgres/db";

export const upload = api<UploadNotesRequest, UploadNotesResponse>(
  { expose: true, method: "POST", path: "/notes/upload" },
  async (req) => {
    const { index } = await getPineconeClient();
    const errors: string[] = [];
    let processedCount = 0;
    
    // Procesar notas en lotes para mayor eficiencia
    const batchSize = 100;
    for (let i = 0; i < req.notes.length; i += batchSize) {
      const batch = req.notes.slice(i, i + batchSize);
      
      try {
        const vectors = await Promise.all(
          batch.map(async (note) => {
            // Guardar en PostgreSQL para obtener un ID numérico
            const result = await db.queryOne<{ id: number }>`
                INSERT INTO notes (title, path, content, updated_at)
                VALUES (${note.title}, ${note.path}, ${note.content}, NOW())
                ON CONFLICT (path)
                DO UPDATE SET
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    updated_at = NOW()
                RETURNING id;
            `;

            const embedding = await getEmbeddings(note.content);
            
            return {
              id: result.id.toString(), // Pinecone usa IDs de tipo string
              values: embedding,
              metadata: {
                title: note.title,
                path: note.path,
                content: note.content.substring(0, 1000), // Truncar contenido para evitar límites en metadatos
              }
            };
          })
        );
        
        await index.upsert(vectors);
        processedCount += batch.length;
      } catch (error: any) {
        errors.push(`Error en el lote que comienza en el índice ${i}: ${error.message}`);
      }
    }
    
    return { processed: processedCount, errors };
  }
);
