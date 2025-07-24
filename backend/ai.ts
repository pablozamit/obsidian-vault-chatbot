import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { secret } from "encore.dev/config";
import { SearchResult } from "./notes/types";

// NO inicializar el secreto aquí.
// const getGoogleApiKey = secret("GoogleAPIKey"); // ESTO ES INCORRECTO

let genAI: GoogleGenerativeAI | null = null;

const getGenAIClient = () => {
    if (genAI) {
        return genAI;
    }
    // Cargar el secreto DENTRO de la función
    const apiKey = secret("GoogleAPIKey")(); 
    if (!apiKey) {
        throw new Error("El secreto GoogleAPIKey no está definido.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
};

// getEmbeddings uses Google's AI to generate embeddings for a given text.
export async function getEmbeddings(text: string): Promise<number[]> {
    const client = getGenAIClient();
    const model = client.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

// generateChatResponse generates a chat response based on a user's message and search results.
export async function generateChatResponse(message: string, sources: SearchResult[]): Promise<string> {
    const client = getGenAIClient();
    const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    });

    const context = sources.map((item) => item.content).join("\n\n");
    const prompt = `Contexto: ${context}\n\nPregunta: ${message}`;
    const result = await model.generateContent(prompt);
    
    return result.response.text();
}
