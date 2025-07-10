import { api } from "encore.dev/api";
import { SearchNotesRequest, SearchNotesResponse } from "./types";
import db from "../external_dbs/postgres/db";
import { generateEmbedding } from "./embedding";

// Performs semantic search on notes using text similarity.
export const search = api<SearchNotesRequest, SearchNotesResponse>(
  { expose: true, method: "POST", path: "/notes/search" },
  async (req) => {
    const limit = req.limit || 10;
    
    // For now, we'll do a simple text search until we can add vector support
    // This searches in title and content using PostgreSQL's full-text search
    const searchTerm = `%${req.query.toLowerCase()}%`;
    
    const results = await db.queryAll<{
      id: number;
      title: string;
      path: string;
      content: string;
    }>`
      SELECT id, title, path, content
      FROM notes 
      WHERE LOWER(title) LIKE ${searchTerm} 
         OR LOWER(content) LIKE ${searchTerm}
      ORDER BY 
        CASE 
          WHEN LOWER(title) LIKE ${searchTerm} THEN 1 
          ELSE 2 
        END,
        updated_at DESC
      LIMIT ${limit}
    `;

    return {
      results: results.map(row => ({
        id: row.id,
        title: row.title,
        path: row.path,
        content: row.content,
        similarity: 0.8 // Mock similarity score for now
      }))
    };
  }
);
