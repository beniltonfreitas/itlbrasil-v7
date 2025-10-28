-- Allow admin users to manage RSS feeds and import logs
-- Note: This is a temporary solution. In production, you should implement proper authentication
-- and restrict these operations to authenticated admin users only.

-- Policies for RSS feeds management
CREATE POLICY "Allow RSS feeds creation" ON public.rss_feeds
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow RSS feeds updates" ON public.rss_feeds
FOR UPDATE USING (true);

CREATE POLICY "Allow RSS feeds deletion" ON public.rss_feeds  
FOR DELETE USING (true);

-- Policies for import logs management
CREATE POLICY "Allow import logs creation" ON public.import_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow import logs updates" ON public.import_logs
FOR UPDATE USING (true);