import { api } from "encore.dev/api";
import { Note } from "./types";
import db from "../external_dbs/postgres/db";

interface GetByPathRequest {
  path: string;
}

interface GetByPathResponse {
  note: Note | null;
}

export const getByPath = api<GetByPathRequest, GetByPathResponse>(
  { expose: true, method: "POST", path: "/notes/get-by-path" },
  async ({ path }) => {
    const note = await db.queryOne<Note>`
      SELECT * FROM notes WHERE path = ${path}
    `;
    return { note: note ?? null };
  }
);
