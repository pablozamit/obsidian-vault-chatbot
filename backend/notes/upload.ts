import { api } from "@encore.dev";
import type { UploadRequest, UploadResponse } from "../types";

export const upload = api<UploadRequest, UploadResponse>({
  path: "/notes/upload",
  method: "POST",
  cors: {
    allowOrigins: ["https://obsidian-vault-chatbot-frontend.vercel.app"],
    allowCredentials: true,
    // 👇  exact literal que llega en el pre‑flight
    allowHeaders: ["content-type"],
    allowMethods: ["POST", "OPTIONS"]
  },
})(async ({ files }) => {
  /* … */
});
