// frontend/pages/NoteViewerPage.tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import backend from '~backend/client';
import type { SearchResult } from '~backend/notes/types';

type SearchResp = { results: SearchResult[] };

export function NoteViewerPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || '';

  const { data, isLoading, error } = useQuery<SearchResp>({
    queryKey: ['note-by-path', path],
    // usamos SOLO el endpoint existente `search` y filtramos por `path`
    queryFn: async () => backend.notes.search({ query: path, limit: 10, threshold: 0 }),
    enabled: !!path,
  });

  if (!path) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>No se ha especificado ninguna nota.</p>
        <p>Por favor, selecciona una nota de la lista.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>Cargando nota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>Error al cargar la nota.</p>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  const results = data?.results ?? [];
  // buscamos coincidencia exacta por path; si no, tomamos el primer resultado
  const note =
    results.find((r) => r.path === path) ??
    results[0] ??
    null;

  if (!note) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>No se encontró la nota con la ruta especificada.</p>
      </div>
    );
  }

  const title =
    (note.title && note.title.trim()) ||
    note.path.split('/').pop()?.replace(/\.md$/i, '') ||
    'Nota sin título';

  // updated_at llega como number en SearchResult (según tus types); lo formateamos si existe
  const updated =
    (note as any).updated_at
      ? new Date(Number((note as any).updated_at)).toLocaleString()
      : null;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {updated && (
            <div className="text-xs text-gray-500 mt-1">Actualizada: {updated}</div>
          )}
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans">{note.content}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
