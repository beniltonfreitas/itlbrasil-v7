import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Academy Course Types
export interface AcademyCourse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  featured_image?: string;
  instructor_id?: string;
  category_id?: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  enrollment_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface AcademyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AcademyLesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  content?: string;
  duration: number;
  order_index: number;
  is_preview: boolean;
  lesson_type: 'video' | 'text' | 'quiz' | 'assignment';
  created_at: string;
  updated_at: string;
}

export interface AcademyEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  status: 'active' | 'completed' | 'dropped';
}

export const useAcademy = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [categories, setCategories] = useState<AcademyCategory[]>([]);

  // Fetch Academy Categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('academy_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias da Academy.",
        variant: "destructive",
      });
    }
  };

  // Fetch Academy Courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_courses')
        .select(`
          *,
          academy_categories (
            name,
            slug,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data as AcademyCourse[] || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Erro ao carregar cursos",
        description: "Não foi possível carregar os cursos da Academy.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create Course
  const createCourse = async (courseData: Omit<AcademyCourse, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_courses')
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Curso criado com sucesso!",
        description: "O novo curso foi adicionado à Academy.",
      });

      await fetchCourses();
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Erro ao criar curso",
        description: "Não foi possível criar o curso. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update Course
  const updateCourse = async (id: string, courseData: Partial<AcademyCourse>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('academy_courses')
        .update(courseData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Curso atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      await fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Erro ao atualizar curso",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete Course
  const deleteCourse = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('academy_courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Curso removido",
        description: "O curso foi removido da Academy.",
      });

      await fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Erro ao remover curso",
        description: "Não foi possível remover o curso.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create Category
  const createCategory = async (categoryData: Omit<AcademyCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Categoria criada!",
        description: "A nova categoria foi adicionada.",
      });

      await fetchCategories();
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Erro ao criar categoria",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enroll Student in Course
  const enrollStudent = async (courseId: string, studentId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_enrollments')
        .insert([{
          course_id: courseId,
          student_id: studentId,
          status: 'active',
          progress_percentage: 0
        }])
        .select()
        .single();

      if (error) throw error;

      // Update course enrollment count
      const { data: courseData } = await supabase
        .from('academy_courses')
        .select('enrollment_count')
        .eq('id', courseId)
        .single();
      
      if (courseData) {
        await supabase
          .from('academy_courses')
          .update({ 
            enrollment_count: (courseData.enrollment_count || 0) + 1 
          })
          .eq('id', courseId);
      }

      toast({
        title: "Matrícula realizada!",
        description: "O aluno foi matriculado no curso com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: "Erro na matrícula",
        description: "Não foi possível matricular o aluno.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get Academy Stats
  const getAcademyStats = async () => {
    try {
      const { data: coursesCount } = await supabase
        .from('academy_courses')
        .select('*', { count: 'exact' });

      const { data: enrollmentsCount } = await supabase
        .from('academy_enrollments')
        .select('*', { count: 'exact' });

      const { data: completionsCount } = await supabase
        .from('academy_enrollments')
        .select('*', { count: 'exact' })
        .eq('status', 'completed');

      return {
        totalCourses: coursesCount?.length || 0,
        totalEnrollments: enrollmentsCount?.length || 0,
        totalCompletions: completionsCount?.length || 0,
        completionRate: enrollmentsCount?.length 
          ? ((completionsCount?.length || 0) / enrollmentsCount.length) * 100
          : 0
      };
    } catch (error) {
      console.error('Error fetching academy stats:', error);
      return {
        totalCourses: 0,
        totalEnrollments: 0,
        totalCompletions: 0,
        completionRate: 0
      };
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  return {
    // State
    loading,
    courses,
    categories,

    // Functions
    fetchCourses,
    fetchCategories,
    createCourse,
    updateCourse,
    deleteCourse,
    createCategory,
    enrollStudent,
    getAcademyStats,

    // Computed
    publishedCourses: courses.filter(course => course.status === 'published'),
    draftCourses: courses.filter(course => course.status === 'draft'),
    featuredCourses: courses.filter(course => course.is_featured && course.status === 'published')
  };
};