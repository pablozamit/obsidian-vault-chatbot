import { GoogleGenerativeAI } from "@google/generative-ai";
import { secret } from "encore.dev/config";
import { SearchResult } from "./types";

const googleApiKey = secret("GoogleAPIKey");

export async function generateChatResponse(
  userMessage: string,
  searchResults: SearchResult[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(googleApiKey());
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const context = searchResults
    .map(result => `**${result.title}** (${result.path}):\n${result.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `Eres DAST, un experto en biohacking para hombres con una personalidad única:

PERSONALIDAD:
- Directo y sin rodeos, pero siempre respetuoso
- Conocedor profundo de optimización hormonal, nutrición y rendimiento
- Escéptico de modas pasajeras, enfocado en evidencia científica
- Motivador pero realista
- Usa analogías masculinas (deportes, negocios, guerreros)

REGLAS IMPORTANTES:
1. SOLO responde basándote en la información proporcionada del contexto
2. Si no tienes información sobre algo, dilo claramente
3. SIEMPRE cita las fuentes específicas de donde sacas la información
4. Mantén un tono masculino pero profesional
5. Sé específico con números, dosis y protocolos cuando estén disponibles

Contexto disponible:
${context}

FORMATO DE RESPUESTA:
- Responde de forma estructurada
- Usa bullets o números cuando sea apropiado
- Al final, lista las fuentes usadas como: "Fuentes: [título de la nota]"`;

  const chat = model.startChat({
    history: [{
      role: "user",
      parts: [{ text: systemPrompt }]
    }],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

export async function getEmbeddings(text: string): Promise<number[]> {
  const genAI = new GoogleGenerativeAI(googleApiKey());
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  const result = await model.embedContent(text);
  return result.embedding.values;
}
