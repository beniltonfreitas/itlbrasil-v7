-- Create table for RSS to JSON schedules
CREATE TABLE public.rss_json_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  feed_ids UUID[] NOT NULL DEFAULT '{}',
  quantity_per_feed INTEGER DEFAULT 3,
  interval_minutes INTEGER DEFAULT 60,
  output_action TEXT DEFAULT 'generate_only' CHECK (output_action IN ('generate_only', 'generate_and_import')),
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for schedule execution logs
CREATE TABLE public.rss_json_schedule_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.rss_json_schedules(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  articles_processed INTEGER DEFAULT 0,
  articles_failed INTEGER DEFAULT 0,
  json_output TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rss_json_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_json_schedule_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for schedules
CREATE POLICY "Admins can manage schedules" 
ON public.rss_json_schedules 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view schedules" 
ON public.rss_json_schedules 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- RLS policies for logs
CREATE POLICY "Admins can manage schedule logs" 
ON public.rss_json_schedule_logs 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view schedule logs" 
ON public.rss_json_schedule_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_rss_json_schedules_updated_at
  BEFORE UPDATE ON public.rss_json_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();