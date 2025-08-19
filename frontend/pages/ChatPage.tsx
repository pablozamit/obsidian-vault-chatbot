// frontend/pages/ChatPage.tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Send, Bot, User, ExternalLink, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { ChatResponse, SearchResult } from '~backend/notes/types';

const API_BASE = import.meta.env.VITE_API_BASE as string;

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: SearchResult[];
}

type AllNotesResponse = {
  notes: { id: string; title: string | null; path: string }[];
};

function NotesSidebar() {
  const { data, isLoading, error } = useQuery<AllNotesResponse>({
    queryKey: ['allNotes'],
    // Llama al backend (Encore) usando la base URL del backend, no el dominio del frontend
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/notes/list-all`, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Library className="w-5 h-5" />
          <span>Todas las Notas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isLoading && <p>Cargando notas...</p>}
        {error && <p className="text-red-500">Error al cargar las notas.</p>}
        {data?.notes && data.notes.length > 0 && (
          <ul className="space-y-2">
            {data.notes.map((note) => (
              <li key={note.id}>
                <Link
                  to={`/note?path=${encodeURIComponent(note.path)}`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                  title={note.path}
                >
                  {note.title?.trim() || note.path.split('/').pop()!.replace(/\.md$/i, '')}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {data?.notes && data.notes.length === 0 && (
          <p className="text-gray-500">No hay notas.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return await backend.notes.chat({
        message,
        conversation_id: conversationId,
      });
    },
    onSuccess: (response: ChatResponse) => {
      setConversationId(response.conversation_id);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'assistant',
          content: response.response,
          sources: response.sources,
        },
      ]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo procesar tu mensaje. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
      },
    ]);

    chatMutation.mutate(userMessage);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chat con tu Bóveda de Obsidian
        </h1>
        <p className="text-gray-600">
          Haz preguntas sobre tus notas y obtén respuestas inteligentes basadas en tu conocimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <NotesSidebar />
        </div>

        <div className="md:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Asistente</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>¡Hola! Soy tu asistente de Obsidian.</p>
                    <p>Pregúntame cualquier cosa sobre tus notas.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'assistant' && (
                            <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          )}
                          {message.type === 'user' && (
                            <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm font-medium mb-2">Fuentes:</p>
                                <div className="space-y-1">
                                  {message.sources.map((source) => (
                                    <Badge
                                      key={source.id}
                                      variant="secondary"
                                      className="mr-1 mb-1"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      {source.title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400"></div>
                          <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  disabled={chatMutation.isPending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || chatMutation.isPending}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
