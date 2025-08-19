import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../external_dbs/postgres/db";

interface ListNotesRequest {
  limit?: Query<number>;
  offset?: Query<number>;
}

// Filas devueltas por /notes (paginado)
type ListedNote = {
  id: string;                 // casteado desde int8 → text
  title: string | null;       // puede venir null
  path: string;
  updated_at: string | null;  // ISO string o null
};

interface ListNotesResponse {
  notes: ListedNote[];
  total: number;
}

// Filas devueltas por /notes/list-all (sin paginar, solo datos mínimos para el sidebar)
type ListedNoteLite = {
  id: string;           // casteado desde int8 → text
  title: string | null; // puede venir null
  path: string;
};

interface ListAllNotesResponse {
  notes: ListedNoteLite[];
}

/**
 * Lista paginada de notas.
 */
export const list = api<ListNotesRequest, ListNotesResponse>(
  { expose: true, method: "GET", path: "/notes" },
  async (req) => {
    const limit = Number(req.limit ?? 200);
    const offset = Number(req.offset ?? 0);

    const notes = await db.query<ListedNote>`
      SELECT
        id::text AS id,
        title,
        path,
        updated_at
      FROM notes
      ORDER BY path ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await db.query<{ count: number }>`
      SELECT COUNT(*)::int AS count FROM notes
    `;

    return {
      notes,
      total: count,
    };
  }
);

/**
 * Lista completa de notas (para el sidebar). No paginada.
 */
export const listAll = api<undefined, ListAllNotesResponse>(
  { expose: true, method: "GET", path: "/notes/list-all" },
  async () => {
    const notes = await db.query<ListedNoteLite>`
      SELECT
        id::text AS id,
        title,
        path
      FROM notes
      ORDER BY path ASC
    `;
    return { notes };
  }
);
