// backend/notes/chat.ts
import { api } from "encore.dev/api";
import { ChatRequest, ChatResponse } from "./types";
import { search } from "./search";
import { generateChatResponse } from "./ai";
import { v4 as uuidv4 } from "uuid";

/** Convierte cualquier valor no‑finito en 0 y omite fields vacíos  */
function clean(obj: any): any {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === "object") {
    const out: Record<string, any> = {};
    for (const k in obj) {
      const v = obj[k];
      if (typeof v === "number") {
        if (Number.isFinite(v)) out[k] = v;
      } else if (v !== undefined && v !== null) {
        out[k] = clean(v);
      }
    }
    return out;
  }
  return obj;
}

export const chat = api<ChatRequest, ChatResponse>(
  { expose: true, method: "POST", path: "/notes/chat" },
  async (req) => {
    const conversation_id = req.conversation_id || uuidv4();

    const { results } = await search({
      query: req.message,
      limit: 5,
      threshold: 0.6,
    });

    const response = await generateChatResponse(req.message, results);

    // Construir fuentes seguras (sin content undefined)
    const sources = results.map((r) => ({
      id: r.id,
      title: r.title,
      path: r.path,
      snippet: typeof r.content === "string" ? r.content.slice(0, 200) : "",
    }));

    return {
      response,
      conversation_id,
      sources: clean(sources),
    };
  }
);
