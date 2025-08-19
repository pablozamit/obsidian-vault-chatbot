// frontend/pages/NoteViewerPage.tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE = import.meta.env.VITE_API_BASE as string;

type NoteResp = {
  note: {
    id: string;
    title: string | null;
    path: string;
    content: string | null;
    updated_at: string | null;
  } | null;
};

export function NoteViewerPage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('path') || '';

  const { data, isLoading, error } = useQuery<NoteResp | null>({
    queryKey: ['note', path],
    queryFn: async () => {
      if (!path) return null;
      const res = await fetch(`${API_BASE}/notes/get-by-path?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
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
