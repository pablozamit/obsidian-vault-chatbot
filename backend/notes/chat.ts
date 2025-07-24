import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
import { search } from "./search";
import { generateChatResponse } from "./ai";
import { v4 as uuidv4 } from "uuid";

export const chat = api(
  {
    expose: true,
    method: "POST",
    path: "/notes/chat",
    cors: {
      allowOrigins: ["https://obsidian-vault-chatbot-frontend.vercel.app"],
      allowCredentials: true,
      allowHeaders: ["Content-Type"],
      allowMethods: ["POST", "OPTIONS"]
    }
  },
  async (req: ChatRequest): Promise<ChatResponse> => {
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
