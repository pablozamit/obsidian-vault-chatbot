// backend/notes/chat.ts
// Maneja el endpoint POST /notes/chat
// Devuelve una respuesta de IA basada en la búsqueda semántica sobre las notas.

import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
import { search } from "./search";
import { generateChatResponse } from "./ai";
import { v4 as uuidv4 } from "uuid";

/**
 * Limpia cualquier número no finito (NaN, Infinity) dentro de los
 * resultados de búsqueda antes de enviarlos al cliente.
 */
function sanitizeSources<T extends Record<string, any>>(sources: T[]): T[] {
  return sources.map((src) => {
    const cleaned: Record<string, any> = { ...src };
    for (const key in cleaned) {
      if (typeof cleaned[key] === "number" && !Number.isFinite(cleaned[key])) {
        cleaned[key] = 0; // o elimínalo si no necesitas el valor
      }
    }
    return cleaned as T;
  });
}

export const chat = api<ChatRequest, ChatResponse>(
  {
    expose: true,
    method: "POST",
    path: "/notes/chat",
  },
  async (req) => {
    // 1. Identificador de conversación (nuevo o reutilizado)
    const conversation_id = req.conversation_id || uuidv4();

    // 2. Búsqueda semántica en las notas
    const { results } = await search({
      query: req.message,
      limit: 5,
      threshold: 0.6,
    });

    // 3. Generar respuesta con el modelo de IA
    const response = await generateChatResponse(req.message, results);

    // 4. Limpiar posibles NaN/Infinity en los scores de similarity, etc.
    const safeSources =
