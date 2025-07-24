import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
import { search } from "./search";
import { generateChatResponse } from "./ai";
import { v4 as uuidv4 } from "uuid";

export const chat = api<ChatRequest, ChatResponse>(
  { expose: true, method: "POST", path: "/notes/chat" },
  async (req) => {
    // Identificador único de la conversación
    const conversationId = req.conversation_id || uuidv4();

    // ------------------------------------------------------------------
    // 1) Búsqueda semántica en Pinecone
    //    – limit    : cuántos vectores devolver como máximo
    //    – threshold: puntuación mínima para que una coincidencia sea válida
    // ------------------------------------------------------------------
    const searchResults = await search({
      query: req.message,
      limit: 5,
      threshold: 0.25   // ← nuevo umbral (antes 0.6)
    });

    // 2) Generación de la respuesta con Gemini / Google AI
    const responseText = await generateChatResponse(
      req.message,
      searchResults.results
    );

    // 3) Envío de la respuesta al cliente
    return {
      response: responseText,
      conversation_id: conversationId,
      sources: searchResults.results
    };
  }
);
