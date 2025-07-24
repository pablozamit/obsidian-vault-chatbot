// backend/notes/chat.ts
import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
import { search } from "./search";
import { generateChatResponse } from "./ai";
import { v4 as uuidv4 } from "uuid";

/**
 * Quita toda propiedad numérica no‑finita en cualquier profundidad
 * y – de paso – elimina el campo similarity/score (no lo necesita el cliente).
 */
function stripUnsafeNumbers<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(stripUnsafeNumbers) as any;
  }
  if (obj !== null && typeof obj === "object") {
    const clean: Record<string, any> = {};
    for (const k in obj) {
      const v = (obj as any)[k];
      if (typeof v === "number") {
        if (Number.isFinite(v)) clean[k] = v; // solo números válidos
        // números no finitos se descartan
      } else if (typeof v === "object") {
        // recursivo
        const nested = stripUnsafeNumbers(v);
        if (Object.keys(nested).length) clean[k] = nested;
      } else {
        clean[k] = v;
      }
    }
    return clean as any;
  }
  return obj;
}

export const chat = api<ChatRequest, ChatResponse>(
  {
    expose: true,
    method: "POST",
    path: "/notes/chat",
  },
  async (req) => {
    const conversation_id = req.conversation_id || uuidv4();

    const { results } = await search({
      query: req.message,
      limit: 5,
      threshold: 0.6,
    });

    const response = await generateChatResponse(req.message, results);

    // limpia números no válidos y quita scores
    const safeSources = stripUnsafeNumbers(
      results.map(({ id, title, path, content }) => ({
        id,
        title,
        path,
        snippet: content.slice(0, 200), // opcional – previsualización
      }))
    );

    return {
      response,
      conversation_id,
      sources: safeSources,
    };
  }
);
