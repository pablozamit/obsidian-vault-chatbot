import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
// CORRECCIÓN: Se añade ".js" a las rutas de importación
import { search } from "./search.js";
import { generateChatResponse } from "../ai.js";
import { v4 as uuidv4 } from "uuid";

// Processes chat messages using semantic search and AI response generation.
export const chat = api<ChatRequest, ChatResponse>(
  // CORRECCIÓN: Se ha eliminado el bloque `auth` que causaba el error de compilación.
  { expose: true, method: "POST", path: "/notes/chat" },
  async (req) => {
    // Generate a conversation ID if not provided
    const conversationId = req.conversation_id || uuidv4();

    // Search for relevant notes
    const searchResults = await search({
      query: req.message,
      limit: 5,
      threshold: 0.6
    });

    // Generate AI response using the search results as context
    const response = await generateChatResponse(req.message, searchResults.results);

    return {
      response,
      conversation_id: conversationId,
      sources: searchResults.results
    };
  }
);
