// backend/notes/chat.ts
import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
import { search } from "./search"; // Importación corregida
import { generateChatResponse } from "./ai"; // CAMBIADO: de "../ai" a "./ai"
import { v4 as uuidv4 } from "uuid";

export const chat = api<ChatRequest, ChatResponse>(
  { expose: true, method: "POST", path: "/notes/chat" },
  async (req) => {
    const conversationId = req.conversation_id || uuidv4();

    const searchResults = await search({
      query: req.message,
      limit: 5,
      threshold: 0.6
    });

    const responseText = await generateChatResponse(req.message, searchResults.results);

    return {
      response: responseText,
      conversation_id: conversationId,
      sources: searchResults.results
    };
  }
);
