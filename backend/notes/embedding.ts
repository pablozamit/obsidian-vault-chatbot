import { GoogleGenerativeAI } from "@google/generative-ai";
import { secret } from "encore.dev/config";

const googleApiKey = secret("GoogleAPIKey");

export async function generateEmbedding(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(googleApiKey());
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  
  const result = await model.embedContent(text);
  return result.embedding.values;
}
