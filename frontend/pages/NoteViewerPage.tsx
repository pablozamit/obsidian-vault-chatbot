import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import backend from '~backend/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NoteViewerPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['note', path],
    queryFn: async () => {
      if (!path) return null;
      return await backend.notes.getByPath({ path });
    },
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

  const note = data?.note;

  if (!note) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>No se encontró la nota con la ruta especificada.</p>
      </div>
    );
  }

  const title =
    note.title?.trim() ||
    note.path.split('/').pop()?.replace(/\.md$/i, '') ||
    'Nota sin título';

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans">{note.content}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
