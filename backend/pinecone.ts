import { Pinecone } from "@pinecone-database/pinecone";

let pinecone: Pinecone | null = null;

// getPineconeClient initializes the Pinecone client.
export const getPineconeClient = async () => {
    if (pinecone) {
        return pinecone;
    }

    // The PINECONE_API_KEY secret is automatically injected into the environment
    // by Encore.
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("PINECONE_API_KEY secret is not defined. Go to https://app.encore.dev to set it.");
    }

    pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });
    return pinecone;
}
