import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

interface ModeloPadraoProps {
  children: React.ReactNode;
}

export const ModeloPadrao: React.FC<ModeloPadraoProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};