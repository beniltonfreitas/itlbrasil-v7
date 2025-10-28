-- Create Community System Tables

-- Community types and statuses
CREATE TYPE community_type AS ENUM ('public', 'private', 'paid', 'secret');
CREATE TYPE community_member_role AS ENUM ('admin', 'moderator', 'member', 'vip');
CREATE TYPE community_post_type AS ENUM ('text', 'image', 'video', 'poll', 'event');
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'support', 'star', 'celebrate', 'angry');

-- Communities table
CREATE TABLE public.communities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,
    type community_type NOT NULL DEFAULT 'public',
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB DEFAULT '{}',
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    monthly_price DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Community members
CREATE TABLE public.community_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role community_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    UNIQUE(community_id, user_id)
);

-- Community posts
CREATE TABLE public.community_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    type community_post_type NOT NULL DEFAULT 'text',
    media_urls TEXT[],
    poll_options JSONB,
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Community comments
CREATE TABLE public.community_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    reaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Community reactions
CREATE TABLE public.community_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    type reaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, post_id, type),
    UNIQUE(user_id, comment_id, type),
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Community events
CREATE TABLE public.community_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    is_online BOOLEAN DEFAULT true,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Community event attendees
CREATE TABLE public.community_event_attendees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.community_events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    attended BOOLEAN DEFAULT false,
    UNIQUE(event_id, user_id)
);

-- Community achievements
CREATE TABLE public.community_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    badge_color TEXT DEFAULT '#3B82F6',
    points_required INTEGER DEFAULT 0,
    criteria JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User achievements
CREATE TABLE public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.community_achievements(id) ON DELETE CASCADE NOT NULL,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id, community_id)
);

-- Community categories
CREATE TABLE public.community_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Community notifications
CREATE TABLE public.community_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Communities policies
CREATE POLICY "Public communities are viewable by everyone" ON public.communities
    FOR SELECT USING (type = 'public' OR auth.uid() IN (
        SELECT user_id FROM public.community_members 
        WHERE community_id = communities.id AND is_active = true
    ));

CREATE POLICY "Community admins can manage communities" ON public.communities
    FOR ALL USING (created_by = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create communities" ON public.communities
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Community members policies
CREATE POLICY "Members can view community membership" ON public.community_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        community_id IN (
            SELECT id FROM public.communities WHERE type = 'public'
        ) OR
        is_admin(auth.uid())
    );

CREATE POLICY "Users can join communities" ON public.community_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Community admins can manage members" ON public.community_members
    FOR ALL USING (
        community_id IN (
            SELECT id FROM public.communities WHERE created_by = auth.uid()
        ) OR
        (user_id = auth.uid()) OR
        is_admin(auth.uid())
    );

-- Community posts policies
CREATE POLICY "Community members can view posts" ON public.community_posts
    FOR SELECT USING (
        community_id IN (
            SELECT cm.community_id FROM public.community_members cm
            WHERE cm.user_id = auth.uid() AND cm.is_active = true
        ) OR
        community_id IN (
            SELECT id FROM public.communities WHERE type = 'public'
        ) OR
        is_admin(auth.uid())
    );

CREATE POLICY "Community members can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND
        community_id IN (
            SELECT cm.community_id FROM public.community_members cm
            WHERE cm.user_id = auth.uid() AND cm.is_active = true
        )
    );

CREATE POLICY "Authors and admins can manage posts" ON public.community_posts
    FOR ALL USING (
        author_id = auth.uid() OR
        community_id IN (
            SELECT id FROM public.communities WHERE created_by = auth.uid()
        ) OR
        is_admin(auth.uid())
    );

-- Other policies (comments, reactions, etc.)
CREATE POLICY "Users can view comments on accessible posts" ON public.community_comments
    FOR SELECT USING (
        post_id IN (
            SELECT id FROM public.community_posts cp
            WHERE cp.community_id IN (
                SELECT cm.community_id FROM public.community_members cm
                WHERE cm.user_id = auth.uid() AND cm.is_active = true
            ) OR cp.community_id IN (
                SELECT id FROM public.communities WHERE type = 'public'
            )
        ) OR is_admin(auth.uid())
    );

CREATE POLICY "Community members can comment" ON public.community_comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND
        post_id IN (
            SELECT cp.id FROM public.community_posts cp
            JOIN public.community_members cm ON cp.community_id = cm.community_id
            WHERE cm.user_id = auth.uid() AND cm.is_active = true
        )
    );

-- Reactions policies
CREATE POLICY "Users can manage their own reactions" ON public.community_reactions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view reactions on accessible content" ON public.community_reactions
    FOR SELECT USING (
        (post_id IN (
            SELECT id FROM public.community_posts cp
            WHERE cp.community_id IN (
                SELECT cm.community_id FROM public.community_members cm
                WHERE cm.user_id = auth.uid() AND cm.is_active = true
            ) OR cp.community_id IN (
                SELECT id FROM public.communities WHERE type = 'public'
            )
        )) OR
        (comment_id IN (
            SELECT cc.id FROM public.community_comments cc
            JOIN public.community_posts cp ON cc.post_id = cp.id
            WHERE cp.community_id IN (
                SELECT cm.community_id FROM public.community_members cm
                WHERE cm.user_id = auth.uid() AND cm.is_active = true
            ) OR cp.community_id IN (
                SELECT id FROM public.communities WHERE type = 'public'
            )
        )) OR is_admin(auth.uid())
    );

-- Events policies
CREATE POLICY "Community members can view events" ON public.community_events
    FOR SELECT USING (
        community_id IN (
            SELECT cm.community_id FROM public.community_members cm
            WHERE cm.user_id = auth.uid() AND cm.is_active = true
        ) OR
        community_id IN (
            SELECT id FROM public.communities WHERE type = 'public'
        ) OR
        is_admin(auth.uid())
    );

CREATE POLICY "Community admins can manage events" ON public.community_events
    FOR ALL USING (
        created_by = auth.uid() OR
        community_id IN (
            SELECT id FROM public.communities WHERE created_by = auth.uid()
        ) OR
        is_admin(auth.uid())
    );

-- Event attendees policies
CREATE POLICY "Users can manage their event attendance" ON public.community_event_attendees
    FOR ALL USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Achievements policies
CREATE POLICY "Achievements are viewable by everyone" ON public.community_achievements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage achievements" ON public.community_achievements
    FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their achievements" ON public.user_achievements
    FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.community_categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.community_categories
    FOR ALL USING (is_admin(auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.community_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.community_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
    BEFORE UPDATE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_events_updated_at
    BEFORE UPDATE ON public.community_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_communities_type ON public.communities(type);
CREATE INDEX idx_communities_slug ON public.communities(slug);
CREATE INDEX idx_community_members_user_community ON public.community_members(user_id, community_id);
CREATE INDEX idx_community_posts_community ON public.community_posts(community_id);
CREATE INDEX idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX idx_community_comments_post ON public.community_comments(post_id);
CREATE INDEX idx_community_reactions_post ON public.community_reactions(post_id);
CREATE INDEX idx_community_reactions_user ON public.community_reactions(user_id);
CREATE INDEX idx_community_events_community ON public.community_events(community_id);
CREATE INDEX idx_community_notifications_user ON public.community_notifications(user_id);