import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import backend from '~backend/client';
import type { UploadNotesResponse } from '~backend/notes/types';

export function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [folderUrl, setFolderUrl] = useState('');
  const [uploadResult, setUploadResult] = useState<UploadNotesResponse | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (notes: { title: string; path: string; content: string }[]) => {
      return await backend.notes.upload({ notes });
    },
    onSuccess: (result: UploadNotesResponse) => {
      setUploadResult(result);
      toast({
        title: 'Carga completada',
        description: `Se procesaron ${result.processed} notas correctamente.`,
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: 'Error en la carga',
        description: 'No se pudieron procesar las notas. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      return await backend.notes.importDrive({ folderUrl });
    },
    onSuccess: (result: UploadNotesResponse) => {
      setUploadResult(result);
      toast({
        title: 'Importación completada',
        description: `Se procesaron ${result.processed} notas desde Google Drive.`,
      });
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: 'Error al importar',
        description: 'No se pudieron importar las notas de Google Drive.',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const markdownFiles = selectedFiles.filter(file => file.name.endsWith('.md'));
    setFiles(markdownFiles);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const notes = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return {
          title: file.name.replace('.md', ''),
          path: file.name,
          content,
        };
      })
    );

    uploadMutation.mutate(notes);
  };

  const handleImport = () => {
    if (!folderUrl) return;
    importMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subir Notas de Obsidian
        </h1>
        <p className="text-gray-600">
          Selecciona los archivos .md de tu bóveda de Obsidian para procesarlos y crear embeddings.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Seleccionar Archivos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Selecciona archivos Markdown</p>
                  <p className="text-gray-500">
                    Elige los archivos .md de tu bóveda de Obsidian
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".md"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button className="mt-4" asChild>
                    <span>Seleccionar Archivos</span>
                  </Button>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
                    </p>
                    <Button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {uploadMutation.isPending ? 'Procesando...' : 'Subir y Procesar'}
                      </span>
                    </Button>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Procesando archivos...</span>
                    <span>Generando embeddings</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Importar desde Google Drive</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="URL de la carpeta de Google Drive"
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                className="w-full border rounded p-2"
              />
              <Button onClick={handleImport} disabled={importMutation.isPending || !folderUrl} className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>{importMutation.isPending ? 'Importando...' : 'Importar y Procesar'}</span>
              </Button>
              {importMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importando notas...</span>
                    <span>Generando embeddings</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Resultado de la Carga</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Procesadas Correctamente</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {uploadResult.processed}
                    </p>
                  </div>
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium">Errores</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {uploadResult.errors.length}
                      </p>
                    </div>
                  )}
                </div>

                {uploadResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Errores encontrados:</p>
                        {uploadResult.errors.map((error, index) => (
                          <p key={index} className="text-sm">• {error}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
