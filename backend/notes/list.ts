import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { Note } from "./types";
import db from "../external_dbs/postgres/db";

interface ListNotesRequest {
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListNotesResponse {
  notes: Note[];
  total: number;
}

export const list = api<ListNotesRequest, ListNotesResponse>(
  { expose: true, method: "GET", path: "/notes" },
  async (req) => {
    console.log("Endpoint /notes/list llamado, devolviendo respuesta vacía.");
    return {
      notes: [],
      total: 0
    };
  }
);

interface ListAllNotesResponse {
  notes: Pick<Note, "id" | "title" | "path">[];
}

export const listAll = api.get("/notes/list-all", async (): Promise<ListAllNotesResponse> => {
  const notes = await db.query<Pick<Note, "id" | "title" | "path">>`
    SELECT id, title, path FROM notes ORDER BY path ASC
  `;
  return { notes };
});
