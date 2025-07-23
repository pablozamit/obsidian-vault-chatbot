import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
// CORRECCIÓN: Rutas de importación relativas y sin extensión
import { search } from "./search";
import { generateChatResponse } from "../ai";
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
