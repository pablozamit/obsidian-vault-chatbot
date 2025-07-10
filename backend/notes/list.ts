import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../external_dbs/postgres/db";
import { Note } from "./types";

interface ListNotesRequest {
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListNotesResponse {
  notes: Note[];
  total: number;
}

// Lists all notes with pagination.
export const list = api<ListNotesRequest, ListNotesResponse>(
  { expose: true, method: "GET", path: "/notes" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    // Get total count
    const countResult = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM notes
    `;
    const total = countResult?.count || 0;

    // Get notes with pagination
    const notes = await db.queryAll<Note>`
      SELECT id, title, path, content, updated_at
      FROM notes
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return {
      notes,
      total
    };
  }
);
