import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { Note } from "./types";

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
