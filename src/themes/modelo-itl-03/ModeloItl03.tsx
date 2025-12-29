import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header03 } from './components/Header03';
import { Footer03 } from './components/Footer03';
import Index from '@/pages/Index';
import Article from '@/pages/Article';
import Category from '@/pages/Category';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/NotFound';
import { SEO } from '@/components/SEO';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

export const ModeloItl03: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="ITL Brasil - International News"
        description="Portal de notícias internacionais com cobertura completa sobre política, economia, tecnologia e muito mais."
      />
      
      <Header03 />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artigo/:slug" element={<Article />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer03 />
      
      <AccessibilityToolbar />
    </div>
  );
};
