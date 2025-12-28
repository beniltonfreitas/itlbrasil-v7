-- Create table to track imports from Notícias AI
CREATE TABLE noticias_ai_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  article_title TEXT NOT NULL,
  article_slug TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT,
  import_type TEXT DEFAULT 'single', -- 'single', 'batch', 'json'
  format_corrected BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'success', -- 'success', 'error'
  error_message TEXT,
  imported_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_noticias_ai_imports_created_at ON noticias_ai_imports(created_at DESC);
CREATE INDEX idx_noticias_ai_imports_status ON noticias_ai_imports(status);

-- Enable RLS
ALTER TABLE noticias_ai_imports ENABLE ROW LEVEL SECURITY;

-- Admins and editors can view/manage imports
CREATE POLICY "Admins can manage noticias_ai_imports"
  ON noticias_ai_imports FOR ALL
  USING (is_admin(auth.uid()));

-- Editors can view
CREATE POLICY "Editors can view noticias_ai_imports"
  ON noticias_ai_imports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin', 'editor')
    )
  );

-- Allow insert for authenticated users (for logging imports)
CREATE POLICY "Authenticated users can log imports"
  ON noticias_ai_imports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);