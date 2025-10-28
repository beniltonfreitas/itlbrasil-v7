-- Add missing RLS policies for Academy tables

-- RLS Policies for Academy Quizzes
CREATE POLICY "Enrolled students can view quizzes" ON public.academy_quizzes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.academy_enrollments 
    WHERE course_id = academy_quizzes.course_id 
    AND student_id = auth.uid()
  ) OR is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.academy_courses 
    WHERE id = academy_quizzes.course_id 
    AND instructor_id = auth.uid()
  )
);

CREATE POLICY "Instructors and admins can manage quizzes" ON public.academy_quizzes
FOR ALL USING (
  is_admin(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.academy_courses 
    WHERE id = academy_quizzes.course_id 
    AND instructor_id = auth.uid()
  )
);

-- RLS Policies for Quiz Attempts
CREATE POLICY "Students can view their quiz attempts" ON public.academy_quiz_attempts
FOR SELECT USING (student_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Students can create quiz attempts" ON public.academy_quiz_attempts
FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage quiz attempts" ON public.academy_quiz_attempts
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for Certificates
CREATE POLICY "Students can view their certificates" ON public.academy_certificates
FOR SELECT USING (student_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "System can issue certificates" ON public.academy_certificates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage certificates" ON public.academy_certificates
FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for Mentorships
CREATE POLICY "Mentors and students can view their mentorships" ON public.academy_mentorships
FOR SELECT USING (
  mentor_id = auth.uid() OR 
  student_id = auth.uid() OR 
  is_admin(auth.uid())
);

CREATE POLICY "Mentors can create mentorships" ON public.academy_mentorships
FOR INSERT WITH CHECK (mentor_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Mentors and admins can manage mentorships" ON public.academy_mentorships
FOR ALL USING (
  mentor_id = auth.uid() OR 
  is_admin(auth.uid())
);

-- RLS Policies for Ebooks
CREATE POLICY "Anyone can view published ebooks" ON public.academy_ebooks
FOR SELECT USING (status = 'published' OR author_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Authors and admins can manage ebooks" ON public.academy_ebooks
FOR ALL USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- RLS Policies for Community Posts
CREATE POLICY "Anyone can view academy community posts" ON public.academy_community_posts
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.academy_community_posts
FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors and admins can manage posts" ON public.academy_community_posts
FOR ALL USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- RLS Policies for Community Comments
CREATE POLICY "Anyone can view academy community comments" ON public.academy_community_comments
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.academy_community_comments
FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors and admins can manage comments" ON public.academy_community_comments
FOR ALL USING (author_id = auth.uid() OR is_admin(auth.uid()));

-- RLS Policies for Sales
CREATE POLICY "Students can view their sales" ON public.academy_sales
FOR SELECT USING (student_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "System can create sales records" ON public.academy_sales
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage sales" ON public.academy_sales
FOR ALL USING (is_admin(auth.uid()));