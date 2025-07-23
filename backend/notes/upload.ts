import { api } from "encore.dev/api";
// CORRECCIÓN: Se usa el alias de ruta '~backend/'
import { getPineconeClient } from "~backend/pinecone.js";
import { getEmbeddings } from "~backend/ai.js";
import { UploadNotesRequest, UploadNotesResponse } from "./types.js";

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
