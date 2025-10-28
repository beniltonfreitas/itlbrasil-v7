import React from 'react';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { Header02 } from './components/Header02';
import { Footer02 } from './components/Footer02';

interface ModeloItl02Props {
  children: React.ReactNode;
}

export const ModeloItl02: React.FC<ModeloItl02Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <AccessibilityToolbar />
      <Header02 />
      <main>
        {children}
      </main>
      <Footer02 />
    </div>
  );
};