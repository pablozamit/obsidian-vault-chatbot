import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { secret } from "encore.dev/config";
import { SearchResult } from "./notes/types";

// NO definir el secreto aquí.

// getEmbeddings usa la IA de Google para generar embeddings.
export async function getEmbeddings(text: string): Promise<number[]> {
    // Obtener la clave DENTRO de la función
    const apiKey = secret("GoogleAPIKey")();
    if (!apiKey) throw new Error("GoogleAPIKey secret not found");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

// generateChatResponse genera una respuesta de chat.
export async function generateChatResponse(message: string, sources: SearchResult[]): Promise<string> {
    // Obtener la clave DENTRO de la función
    const apiKey = secret("GoogleAPIKey")();
    if (!apiKey) throw new Error("GoogleAPIKey secret not found");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
    });

    const context = sources.map((item) => item.content).join("\n\n");
    const prompt = `Contexto: ${context}\n\nPregunta: ${message}`;
    const result = await model.generateContent(prompt);
    
    return result.response.text();
}
