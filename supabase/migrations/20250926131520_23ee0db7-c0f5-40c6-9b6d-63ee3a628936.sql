-- Fix RLS policies for categories table
CREATE POLICY "Allow category creation" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow category updates" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow category deletion" ON public.categories FOR DELETE USING (true);

-- Fix RLS policies for authors table  
CREATE POLICY "Allow author creation" ON public.authors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow author updates" ON public.authors FOR UPDATE USING (true);
CREATE POLICY "Allow author deletion" ON public.authors FOR DELETE USING (true);