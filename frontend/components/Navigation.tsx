import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              Obsidian Vault Assistant
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
