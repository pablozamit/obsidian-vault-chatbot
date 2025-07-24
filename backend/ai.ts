import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { secret } from "encore.dev/config";
import { SearchResult } from "./notes/types";

// 1. DEFINIR el getter del secreto a nivel global
const getGoogleApiKey = secret("GoogleAPIKey");

let genAI: GoogleGenerativeAI | null = null;

// getGenAIClient inicializa el cliente de IA si no existe
const getGenAIClient = () => {
    if (genAI) {
        return genAI;
    }
    
    // 2. OBTENER el valor del secreto llamando al getter DENTRO de la función
    const apiKey = getGoogleApiKey(); 
    if (!apiKey) {
        throw new Error("El secreto GoogleAPIKey no está definido o no se pudo cargar.");
    }

    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
};

// getEmbeddings usa la IA de Google para generar embeddings.
export async function getEmbeddings(text: string): Promise<number[]> {
    const client = getGenAIClient();
    const model = client.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

// generateChatResponse genera una respuesta de chat.
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
