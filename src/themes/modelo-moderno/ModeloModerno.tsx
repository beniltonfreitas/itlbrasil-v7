import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

interface ModeloModernoProps {
  children: React.ReactNode;
}

export const ModeloModerno: React.FC<ModeloModernoProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AccessibilityToolbar />
      
      {/* Header com efeito glassmorphism */}
      <div className="backdrop-blur-sm bg-background/80 border-b border-border/50 sticky top-0 z-50">
        <Header />
      </div>
      
      <main className="pt-20 relative">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        {/* Container com animações */}
        <div className="relative z-10 animate-fade-in">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};