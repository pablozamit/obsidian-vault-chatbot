import { secret } from "encore.dev/config";
import { SearchResult } from "./types";

const openAIKey = secret("OpenAIKey");

export async function generateChatResponse(
  userMessage: string,
  searchResults: SearchResult[]
): Promise<string> {
  // Prepare context from search results
  const context = searchResults
    .map(result => `**${result.title}** (${result.path}):\n${result.content}`)
    .join("\n\n---\n\n");

  const systemPrompt = `Eres un asistente inteligente que ayuda a responder preguntas basándose en una bóveda de conocimiento personal de Obsidian. 

Usa la siguiente información de contexto para responder la pregunta del usuario de manera precisa y útil. Si la información no está disponible en el contexto, dilo claramente.

Contexto de la bóveda:
${context}

Instrucciones:
- Responde en español
- Sé preciso y conciso
- Cita las fuentes cuando sea relevante mencionando el título de la nota
- Si no tienes información suficiente, dilo claramente
- Mantén un tono profesional pero amigable`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAIKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
