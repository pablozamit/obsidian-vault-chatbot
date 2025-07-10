import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Chat', icon: MessageCircle },
    { path: '/upload', label: 'Subir Notas', icon: Upload },
    { path: '/notes', label: 'Explorar Notas', icon: FileText },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              Obsidian Vault Assistant
            </h1>
            <div className="flex space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
