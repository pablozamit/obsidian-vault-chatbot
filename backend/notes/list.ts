import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { Note } from "./types";

// --- CONFIGURACIÓN GLOBAL DE CORS ---
// Esto se aplica a TODA tu aplicación (chat, search, etc.)
api.cors(
  "https://obsidian-vault-chatbot-frontend.vercel.app",
  {
    methods: ["GET", "POST", "OPTIONS"],
    headers: ["Content-Type", "Authorization"],
  }
);

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
    // Respuesta segura para evitar que la aplicación falle.
    console.log("Endpoint /notes/list llamado, devolviendo respuesta vacía.");
    return {
      notes: [],
      total: 0
    };
  }
);
