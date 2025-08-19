import { api } from "encore.dev/api";
import db from "../external_dbs/postgres/db";

interface GetByPathRequest {
  path: string;
}

interface GetByPathResponse {
  note: {
    id: string;        // ← string, no number
    title: string | null;
    path: string;
    content: string | null;
    updated_at: string | null;
  } | null;
}

export const getByPath = api<GetByPathRequest, GetByPathResponse>(
  { expose: true, method: "GET", path: "/notes/get-by-path" },
  async ({ path }) => {
    const rows = await db.query<GetByPathResponse["note"]>`
      SELECT
        id::text AS id,
        title,
        path,
        content,
        updated_at
      FROM notes
      WHERE path = ${path}
      LIMIT 1
    `;
    return { note: rows[0] ?? null };
  }
);
