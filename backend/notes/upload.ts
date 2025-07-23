import { api } from "encore.dev/api";
// CORRECCIÓN: Se añade ".js" a las rutas de importación
import { getPineconeClient } from "../pinecone.js";
import { getEmbeddings } from "../ai.js";
import { UploadNotesRequest, UploadNotesResponse } from "./types.js";

// Processes requests to upload and index notes.
export const upload = api<UploadNotesRequest, UploadNotesResponse>(
  { expose: true, method: "POST", path: "/notes/upload" },
  async (req) => {
    const pinecone = await getPineconeClient();
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    for (const note of req.notes) {
      const embedding = await getEmbeddings(note.content);
      await index.upsert([{
        id: note.path,
        values: embedding,
        metadata: {
          title: note.title,
          content: note.content,
          path: note.path,
          updated_at: note.mtime
        }
      }]);
    }

    return { success: true };
  }
);
