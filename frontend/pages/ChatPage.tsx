import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Bot, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { ChatResponse, SearchResult } from '~backend/notes/types';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: SearchResult[];
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

    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: userMessage,
      },
    ]);

    // Send to backend
    chatMutation.mutate(userMessage);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chat con tu Bóveda de Obsidian
        </h1>
        <p className="text-gray-600">
          Haz preguntas sobre tus notas y obtén respuestas inteligentes basadas en tu conocimiento.
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Asistente</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
  );
}
