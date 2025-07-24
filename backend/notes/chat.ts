import { api } from "@encore.dev";
import type { ChatRequest, ChatResponse } from "../types";

export const chat = api<ChatRequest, ChatResponse>({
  path: "/notes/chat",
  method: "POST",
  // 👇 CORS exacto para tu frontend
  cors: {
    allowOrigins: ["https://obsidian-vault-chatbot-frontend.vercel.app"],
    allowCredentials: true,
    // 👇  exact literal que llega en el pre‑flight
    allowHeaders: ["content-type"],
    allowMethods: ["POST", "OPTIONS"]
  },
})(async ({ message }) => {
  /* … tu lógica … */
});
