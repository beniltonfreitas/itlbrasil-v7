-- Tabelas para ITL Studio e funcionalidades TV

-- Sessões de estúdio
CREATE TABLE studio_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('easy', 'advanced')),
  status text NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'live', 'ended')),
  stream_key text,
  youtube_stream_id text,
  participants jsonb DEFAULT '[]',
  settings jsonb DEFAULT '{}',
  layout_type text DEFAULT 'fullscreen',
  chat_enabled boolean DEFAULT true,
  recording_enabled boolean DEFAULT true,
  viewer_count integer DEFAULT 0,
  created_by uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Participantes de sessão
CREATE TABLE session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES studio_sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  role text DEFAULT 'guest' CHECK (role IN ('host', 'co-host', 'guest', 'viewer')),
  join_token text UNIQUE,
  permissions jsonb DEFAULT '{"camera": true, "microphone": true, "screen_share": false}',
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left')),
  peer_id text,
  joined_at timestamptz,
  left_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Integrações de plataformas externas
CREATE TABLE platform_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(user_id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('youtube', 'facebook', 'instagram', 'twitch', 'linkedin')),
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  channel_id text,
  channel_name text,
  settings jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Gravações de estúdio
CREATE TABLE studio_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES studio_sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  duration integer, -- em segundos
  file_size bigint,
  format text DEFAULT 'mp4',
  quality text DEFAULT 'hd',
  status text DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Métricas de transmissão
CREATE TABLE stream_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES studio_sessions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  viewer_count integer DEFAULT 0,
  platform text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE studio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_analytics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para studio_sessions
CREATE POLICY "Users can view their own studio sessions" 
ON studio_sessions FOR SELECT 
USING (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Users can create their own studio sessions" 
ON studio_sessions FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own studio sessions" 
ON studio_sessions FOR UPDATE 
USING (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own studio sessions"
ON studio_sessions FOR DELETE
USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- Políticas RLS para session_participants
CREATE POLICY "Anyone can view session participants"
ON session_participants FOR SELECT
USING (true);

CREATE POLICY "Users can manage participants in their sessions"
ON session_participants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM studio_sessions 
    WHERE id = session_participants.session_id 
    AND created_by = auth.uid()
  ) OR is_admin(auth.uid())
);

-- Políticas RLS para platform_integrations
CREATE POLICY "Users can manage their own integrations"
ON platform_integrations FOR ALL
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Políticas RLS para studio_recordings
CREATE POLICY "Users can view recordings from their sessions"
ON studio_recordings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM studio_sessions 
    WHERE id = studio_recordings.session_id 
    AND created_by = auth.uid()
  ) OR is_admin(auth.uid())
);

CREATE POLICY "System can manage recordings"
ON studio_recordings FOR ALL
USING (is_admin(auth.uid()));

-- Políticas RLS para stream_analytics
CREATE POLICY "Users can view analytics from their sessions"
ON stream_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM studio_sessions 
    WHERE id = stream_analytics.session_id 
    AND created_by = auth.uid()
  ) OR is_admin(auth.uid())
);

CREATE POLICY "System can insert analytics"
ON stream_analytics FOR INSERT
WITH CHECK (true);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_studio_sessions_updated_at
  BEFORE UPDATE ON studio_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();

CREATE TRIGGER update_platform_integrations_updated_at
  BEFORE UPDATE ON platform_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();

CREATE TRIGGER update_studio_recordings_updated_at
  BEFORE UPDATE ON studio_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();