import { api } from "@encore.dev";
import type { SearchRequest, SearchResponse } from "../types";

export const search = api<SearchRequest, SearchResponse>({
  path: "/notes/search",
  method: "POST",
  cors: {
    allowOrigins: ["https://obsidian-vault-chatbot-frontend.vercel.app"],
    allowCredentials: true,
  },
})(async ({ query }) => {
  /* … */
});
