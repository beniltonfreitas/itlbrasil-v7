-- Create Academy Categories Table
CREATE TABLE public.academy_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Courses Table
CREATE TABLE public.academy_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  featured_image TEXT,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.academy_categories(id) ON DELETE SET NULL,
  price DECIMAL(10,2) DEFAULT 0,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER DEFAULT 0, -- em minutos
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  enrollment_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Lessons Table
CREATE TABLE public.academy_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  duration INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  lesson_type TEXT DEFAULT 'video' CHECK (lesson_type IN ('video', 'text', 'quiz', 'assignment')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Enrollments Table
CREATE TABLE public.academy_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(course_id, student_id)
);

-- Create Academy Progress Table
CREATE TABLE public.academy_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.academy_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  UNIQUE(enrollment_id, lesson_id)
);

-- Create Academy Quizzes Table
CREATE TABLE public.academy_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit INTEGER, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Quiz Attempts Table
CREATE TABLE public.academy_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.academy_quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}'::jsonb,
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  attempt_number INTEGER DEFAULT 1
);

-- Create Academy Certificates Table
CREATE TABLE public.academy_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_number TEXT NOT NULL UNIQUE,
  UNIQUE(course_id, student_id)
);

-- Create Academy Mentorships Table
CREATE TABLE public.academy_mentorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.academy_courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60, -- em minutos
  meeting_url TEXT,
  replay_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Ebooks Table
CREATE TABLE public.academy_ebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.academy_categories(id) ON DELETE SET NULL,
  cover_image TEXT,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  price DECIMAL(10,2) DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Achievements Table
CREATE TABLE public.academy_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  points_required INTEGER DEFAULT 0,
  criteria JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create User Academy Achievements Table
CREATE TABLE public.user_academy_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.academy_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create Academy Community Posts Table
CREATE TABLE public.academy_community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.academy_courses(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'announcement', 'poll')),
  poll_options JSONB,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Community Comments Table
CREATE TABLE public.academy_community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.academy_community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.academy_community_comments(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Academy Sales Table
CREATE TABLE public.academy_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('course', 'ebook', 'mentorship')),
  item_id UUID NOT NULL,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academy_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Academy Categories
CREATE POLICY "Anyone can view academy categories" ON public.academy_categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage academy categories" ON public.academy_categories FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for Academy Courses
CREATE POLICY "Anyone can view published courses" ON public.academy_courses FOR SELECT USING (status = 'published' OR is_admin(auth.uid()) OR instructor_id = auth.uid());
CREATE POLICY "Instructors and admins can manage courses" ON public.academy_courses FOR ALL USING (is_admin(auth.uid()) OR instructor_id = auth.uid());

-- RLS Policies for Academy Lessons
CREATE POLICY "Enrolled students can view lessons" ON public.academy_lessons 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.academy_enrollments 
    WHERE course_id = academy_lessons.course_id 
    AND student_id = auth.uid()
  ) OR is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.academy_courses 
    WHERE id = academy_lessons.course_id 
    AND instructor_id = auth.uid()
  )
);

CREATE POLICY "Instructors and admins can manage lessons" ON public.academy_lessons 
FOR ALL USING (
  is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.academy_courses 
    WHERE id = academy_lessons.course_id 
    AND instructor_id = auth.uid()
  )
);

-- RLS Policies for Enrollments
CREATE POLICY "Students can view their enrollments" ON public.academy_enrollments FOR SELECT USING (student_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Students can enroll themselves" ON public.academy_enrollments FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins can manage all enrollments" ON public.academy_enrollments FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for Progress
CREATE POLICY "Students can view their progress" ON public.academy_progress 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.academy_enrollments 
    WHERE id = academy_progress.enrollment_id 
    AND student_id = auth.uid()
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Students can update their progress" ON public.academy_progress 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.academy_enrollments 
    WHERE id = academy_progress.enrollment_id 
    AND student_id = auth.uid()
  ) OR is_admin(auth.uid())
);

-- RLS Policies for other tables (similar pattern)
CREATE POLICY "Admins can manage achievements" ON public.academy_achievements FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active achievements" ON public.academy_achievements FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their achievements" ON public.user_academy_achievements FOR SELECT USING (user_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "System can award achievements" ON public.user_academy_achievements FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_academy_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_academy_categories_updated_at BEFORE UPDATE ON public.academy_categories FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at_column();
CREATE TRIGGER update_academy_courses_updated_at BEFORE UPDATE ON public.academy_courses FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at_column();
CREATE TRIGGER update_academy_lessons_updated_at BEFORE UPDATE ON public.academy_lessons FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at_column();
CREATE TRIGGER update_academy_ebooks_updated_at BEFORE UPDATE ON public.academy_ebooks FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at_column();
CREATE TRIGGER update_academy_community_posts_updated_at BEFORE UPDATE ON public.academy_community_posts FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at_column();

-- Insert default categories
INSERT INTO public.academy_categories (name, slug, description, icon, color) VALUES 
('Marketing', 'marketing', 'Estratégias e técnicas de marketing', 'TrendingUp', '#3B82F6'),
('Vendas', 'vendas', 'Técnicas de vendas e relacionamento', 'Target', '#10B981'),
('Tecnologia', 'tecnologia', 'Cursos de programação e tecnologia', 'Code', '#8B5CF6'),
('Inclusão', 'inclusao', 'Diversidade e inclusão no ambiente de trabalho', 'Users', '#F59E0B'),
('Liderança', 'lideranca', 'Desenvolvimento de líderes', 'Crown', '#EF4444'),
('Comunicação', 'comunicacao', 'Técnicas de comunicação efetiva', 'MessageCircle', '#06B6D4');