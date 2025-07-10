import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import backend from '~backend/client';
import type { Note } from '~backend/notes/types';

export function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes', page],
    queryFn: async () => {
      return await backend.notes.list({
        limit: pageSize,
        offset: page * pageSize,
      });
    },
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return null;
      return await backend.notes.search({
        query: searchQuery,
        limit: 20,
        threshold: 0.5,
      });
    },
    enabled: !!searchQuery.trim(),
  });

  const displayNotes = searchQuery.trim() 
    ? searchResults?.results || []
    : notesData?.notes || [];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Explorar Notas
        </h1>
        <p className="text-gray-600">
          Busca y explora todas las notas de tu bóveda de Obsidian.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar en tus notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {searchQuery && (
        <div className="mb-4">
          <Badge variant="secondary">
            {isSearching ? 'Buscando...' : `Búsqueda: "${searchQuery}"`}
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {isLoading || isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayNotes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchQuery ? 'No se encontraron notas para tu búsqueda.' : 'No hay notas disponibles.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start justify-between">
                      <span className="truncate">{note.title}</span>
                      {'similarity' in note && (
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          {Math.round((note as any).similarity * 100)}%
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(note.updated_at)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-mono">
                        {note.path}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {truncateContent(note.content)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!searchQuery && notesData && (
              <div className="flex justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Página {page + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={displayNotes.length < pageSize}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
