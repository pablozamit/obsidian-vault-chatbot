import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from './components/Navigation';
import { UploadPage } from './pages/UploadPage';
import { ChatPage } from './pages/ChatPage';
import { NotesPage } from './pages/NotesPage';
import { NoteViewerPage } from './pages/NoteViewerPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/note" element={<NoteViewerPage />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}
