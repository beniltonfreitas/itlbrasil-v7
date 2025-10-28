import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

interface ModeloCompactoProps {
  children: React.ReactNode;
}

export const ModeloCompacto: React.FC<ModeloCompactoProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-sm">
      <AccessibilityToolbar />
      
      {/* Header compacto */}
      <div className="border-b border-border">
        <div className="container mx-auto">
          <Header />
        </div>
      </div>
      
      <main className="pt-16">
        {/* Layout minimalista e denso */}
        <div className="container mx-auto px-4 py-2">
          <div className="max-w-6xl mx-auto space-y-4">
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer compacto */}
      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
};