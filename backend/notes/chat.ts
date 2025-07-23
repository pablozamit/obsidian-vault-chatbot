import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types.js";
// CORRECCIÓN: Se usa el alias de ruta '~backend/'
import { search } from "~backend/notes/search.js";
import { generateChatResponse } from "~backend/ai.js";
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

    const response = await generateChatResponse(req.message, searchResults.results);

    return {
      response,
      conversation_id: conversationId,
      sources: searchResults.results
    };
  }
);
