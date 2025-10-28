import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

interface ModeloMagazineProps {
  children: React.ReactNode;
}

export const ModeloMagazine: React.FC<ModeloMagazineProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />
      
      {/* Header estilo magazine */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <Header />
      </div>
      
      <main className="pt-20">
        {/* Layout focado em imagens */}
        <div className="relative">
          {/* Faixa decorativa */}
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
          
          {/* Conteúdo com espaçamento magazine */}
          <div className="px-4 md:px-8 lg:px-12">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};