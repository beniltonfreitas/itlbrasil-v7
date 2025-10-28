-- Remove the specific Metrópole Online feeds
DELETE FROM public.rss_feeds 
WHERE id IN (
  'dfeecfd4-3743-49eb-b647-d91b88351ecf',  -- Caieiras
  'bc6bb492-a368-459f-86f8-7d48cda5d0cd',  -- Economia
  '24e5a5e0-d3a4-4fe5-b01f-548d70c8c207',  -- Jundiaí
  'ee812962-de75-41b2-8e62-6ce1b9416f9a'   -- Polícia
);