export interface Note {
  id: number;
  title: string;
  path: string;
  content: string;
  updated_at: Date;
}

export interface UploadNotesRequest {
  notes: {
    title: string;
    path: string;
    content: string;
  }[];
}

export interface UploadNotesResponse {
  processed: number;
  errors: string[];
}

export interface SearchNotesRequest {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  path: string;
  content: string;
  similarity: number; // Renombrado de 'score' para consistencia
  updated_at: number;  // Añadido campo faltante
}

export interface SearchNotesResponse {
  results: SearchResult[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  sources: SearchResult[];
}

export interface ImportDriveRequest {
  folderUrl: string;
}
