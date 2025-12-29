import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header05 } from './components/Header05';
import { Footer05 } from './components/Footer05';
import { BreakingNewsBar05 } from './components/BreakingNewsBar05';
import { Index05 } from './pages/Index05';
import { Article05 } from './pages/Article05';
import Category from '@/pages/Category';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

export const ModeloItl05: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BreakingNewsBar05 />
      <Header05 />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index05 />} />
          <Route path="/artigo/:slug" element={<Article05 />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer05 />
      
      <AccessibilityToolbar />
    </div>
  );
};
