-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create authors table
CREATE TABLE public.authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES public.categories(id),
  author_id UUID REFERENCES public.authors(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_time INTEGER DEFAULT 5,
  featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT
);

-- Create newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  preferences JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  confirmed BOOLEAN DEFAULT false,
  confirmation_token TEXT UNIQUE
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for news portal)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Authors are viewable by everyone" 
ON public.authors FOR SELECT USING (true);

CREATE POLICY "Published articles are viewable by everyone" 
ON public.articles FOR SELECT USING (published_at IS NOT NULL);

CREATE POLICY "Newsletter subscribers can view their own data" 
ON public.newsletter_subscribers FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_author ON public.articles(author_id);
CREATE INDEX idx_articles_published ON public.articles(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_featured ON public.articles(featured) WHERE featured = true;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
INSERT INTO public.categories (name, slug, description, color, icon) VALUES 
('Geopolítica', 'geopolitica', 'Análises e notícias sobre relações internacionais e política mundial', '#1e40af', 'Globe'),
('Economia', 'economia', 'Mercados financeiros, economia global e análises econômicas', '#059669', 'DollarSign'),
('Sociedade', 'sociedade', 'Questões sociais, direitos humanos e mudanças culturais', '#dc2626', 'Users'),
('Meio Ambiente', 'meio-ambiente', 'Sustentabilidade, mudanças climáticas e políticas ambientais', '#16a34a', 'Leaf'),
('Tecnologia', 'tecnologia', 'Inovações tecnológicas e seu impacto na sociedade', '#2563eb', 'Smartphone'),
('Esportes', 'esportes', 'Cobertura esportiva com foco geopolítico', '#ea580c', 'Trophy'),
('Cultura', 'cultura', 'Arte, cultura e expressões culturais pelo mundo', '#9333ea', 'Palette');

INSERT INTO public.authors (name, slug, bio) VALUES 
('Dr. Carlos Silva', 'dr-carlos-silva', 'Doutor em Relações Internacionais com especialização em geopolítica global.'),
('Ana Santos', 'ana-santos', 'Jornalista especializada em diplomacia e política internacional.'),
('Ricardo Oliveira', 'ricardo-oliveira', 'Economista e analista de mercados globais.'),
('Maria Costa', 'maria-costa', 'Especialista em tecnologia e inovação digital.');