// backend/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";
import { secret } from "encore.dev/config";

// Definir secretos usando la función de Encore
const getPineconeKey = secret("PineconeAPIKey");
const getPineconeIndexName = secret("PineconeIndexName");

let pinecone: Pinecone | null = null;
let pineconeIndex: any = null;

// getPineconeClient inicializa y devuelve el cliente y el índice de Pinecone.
export const getPineconeClient = async () => {
    if (pinecone && pineconeIndex) {
        return { pinecone, index: pineconeIndex };
    }

    const apiKey = getPineconeKey();
    if (!apiKey) {
        throw new Error("El secreto PineconeAPIKey no está definido.");
    }

    pinecone = new Pinecone({
        apiKey: apiKey,
    });

    const indexName = getPineconeIndexName();
    if (!indexName) {
        throw new Error("El secreto PineconeIndexName no está definido.");
    }
    
    pineconeIndex = pinecone.index(indexName);

    return { pinecone, index: pineconeIndex };
}
