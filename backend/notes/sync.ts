import { api } from "encore.dev/api";
import db from "../external_dbs/postgres/db";
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbeddings as generateEmbedding } from "./ai"; // CAMBIADO: de "../ai" a "./ai"
import { secret } from "encore.dev/config";

const getPineconeKey = secret("PineconeAPIKey");
const getPineconeIndex = secret("PineconeIndexName");

interface SyncResponse {
  synced: number;
  errors: string[];
}

export const syncToPinecone = api<void, SyncResponse>(
  { expose: true, method: "POST", path: "/notes/sync-pinecone" },
  async () => {
    const pc = new Pinecone({
      apiKey: getPineconeKey()
    });
    const index = pc.index(getPineconeIndex());
    
    const notes = await db.queryAll<{
      id: number;
      title: string;
      path: string;
      content: string;
    }>`SELECT id, title, path, content FROM notes`;
    
    let synced = 0;
    const errors: string[] = [];
    
    // Procesar en lotes
    const batchSize = 10;
    for (let i = 0; i < notes.length; i += batchSize) {
      const batch = notes.slice(i, i + batchSize);
      
      try {
        const vectors = await Promise.all(
          batch.map(async (note) => ({
            id: note.id.toString(),
            values: await generateEmbedding(note.content),
            metadata: {
              title: note.title,
              path: note.path,
              content: note.content.substring(0, 1000) // Limitar tamaño
            }
          }))
        );
        
        await index.upsert(vectors);
        synced += batch.length;
      } catch (error) {
        errors.push(`Error en lote ${i}-${i + batchSize}: ${error}`);
      }
    }
    
    return { synced, errors };
  }
);
