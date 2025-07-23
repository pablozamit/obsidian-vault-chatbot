import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
// Se eliminó la importación de la base de datos 'db' que causaba el error.
import { Note } from "./types";

// --- CONFIGURACIÓN GLOBAL DE CORS ---
// Esto se aplica a TODA tu aplicación (chat, search, etc.) y soluciona el error
// "Access-Control-Allow-Origin" que estás viendo.
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
    // El código original que intentaba usar una base de datos SQL ha sido eliminado.
    // Esta es una respuesta temporal para evitar que la aplicación falle.
    // Si necesitas listar notas, deberás implementar la lógica para obtenerlas desde Pinecone.
    console.log("Endpoint /notes/list llamado, devolviendo respuesta vacía.");

    return {
      notes: [],
      total: 0
    };
  }
);
