import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { Separator } from '@/components/ui/separator';

interface ModeloClassicoProps {
  children: React.ReactNode;
}

export const ModeloClassico: React.FC<ModeloClassicoProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />
      
      {/* Header Clássico com bordas */}
      <div className="border-b-2 border-primary">
        <Header />
      </div>
      
      {/* Layout com sidebar */}
      <div className="flex min-h-screen pt-20">
        {/* Sidebar */}
        <aside className="w-64 bg-muted/30 p-4 border-r">
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Categorias</h3>
            <Separator />
            <nav className="space-y-2">
              <a href="#" className="block py-2 px-3 rounded hover:bg-muted text-sm">Política</a>
              <a href="#" className="block py-2 px-3 rounded hover:bg-muted text-sm">Economia</a>
              <a href="#" className="block py-2 px-3 rounded hover:bg-muted text-sm">Internacional</a>
              <a href="#" className="block py-2 px-3 rounded hover:bg-muted text-sm">Esportes</a>
            </nav>
          </div>
        </aside>
        
        {/* Conteúdo principal */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};