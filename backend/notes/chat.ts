import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
import { search } from "./search";
import { generateChatResponse } from "./ai";
import { v4 as uuidv4 } from "uuid";

// Processes chat messages using semantic search and AI response generation.
export const chat = api<ChatRequest, ChatResponse>(
  {
    expose: true,
    method: "POST",
    path: "/notes/chat",
    // Esta es la línea que soluciona el problema de CORS
    auth: {
      cors: "https://obsidian-vault-chatbot-frontend.vercel.app",
    },
  },
  async (req) => {
    // Generate a conversation ID if not provided
    const conversationId = req.conversation_id || uuidv4();

    // Search for relevant notes
    const searchResults = await search({
      query: req.message,
      limit: 5,
      threshold: 0.6,
    });

    // Generate AI response using the search results as context
    const response = await generateChatResponse(
      req.message,
      searchResults.results
    );

    return {
      response,
      conversation_id: conversationId,
      sources: searchResults.results,
    };
  }
);
