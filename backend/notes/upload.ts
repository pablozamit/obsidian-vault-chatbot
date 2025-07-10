import { api, APIError } from "encore.dev/api";
import { UploadNotesRequest, UploadNotesResponse } from "./types";
import db from "../external_dbs/postgres/db";

// Uploads and processes Obsidian vault notes.
export const upload = api<UploadNotesRequest, UploadNotesResponse>(
  { expose: true, method: "POST", path: "/notes/upload" },
  async (req) => {
    const errors: string[] = [];
    let processed = 0;

    for (const note of req.notes) {
      try {
        // Insert or update the note in the database
        await db.exec`
          INSERT INTO notes (title, path, content, updated_at)
          VALUES (${note.title}, ${note.path}, ${note.content}, NOW())
          ON CONFLICT (path) 
          DO UPDATE SET 
            title = EXCLUDED.title,
            content = EXCLUDED.content,
            updated_at = NOW()
        `;
        
        processed++;
      } catch (error) {
        const errorMsg = `Failed to process note ${note.path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
      }
    }

    return {
      processed,
      errors
    };
  }
);
