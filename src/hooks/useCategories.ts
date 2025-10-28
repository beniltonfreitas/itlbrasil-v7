import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    articles: number;
  };
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      // Fetch article counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('articles')
            .select('id', { count: 'exact' })
            .eq('category_id', category.id)
            .not('published_at', 'is', null);

          return {
            ...category,
            _count: {
              articles: count || 0
            }
          };
        })
      );

      return categoriesWithCounts;
    },
  });
};