import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DuplicateInfo {
  isDuplicate: boolean;
  matchType: 'title' | 'url' | 'slug' | null;
  existingArticle?: {
    id: string;
    title: string;
    slug: string;
    published_at: string | null;
  };
  similarity?: number;
}

export interface ArticleWithDuplicateInfo {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
  feedId: string;
  feedName: string;
  selected: boolean;
  duplicateInfo?: DuplicateInfo;
}

// Simple string similarity using Levenshtein-based approach
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Use word overlap for longer strings (more efficient)
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  return intersection / union;
};

const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const useDuplicateDetection = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [duplicatesCount, setDuplicatesCount] = useState(0);

  const checkDuplicates = async (articles: ArticleWithDuplicateInfo[]): Promise<ArticleWithDuplicateInfo[]> => {
    if (articles.length === 0) return articles;
    
    setIsChecking(true);
    
    try {
      // Fetch recent articles from DB (last 30 days for performance)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: existingArticles, error } = await supabase
        .from('articles')
        .select('id, title, slug, source_url, published_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) {
        console.error('[useDuplicateDetection] Error fetching articles:', error);
        return articles;
      }

      let duplicates = 0;
      
      const articlesWithDuplicateInfo = articles.map(article => {
        let duplicateInfo: DuplicateInfo = {
          isDuplicate: false,
          matchType: null
        };

        // Check by URL first (exact match)
        const urlMatch = existingArticles?.find(
          existing => existing.source_url && 
            existing.source_url.toLowerCase() === article.link.toLowerCase()
        );
        
        if (urlMatch) {
          duplicateInfo = {
            isDuplicate: true,
            matchType: 'url',
            existingArticle: {
              id: urlMatch.id,
              title: urlMatch.title,
              slug: urlMatch.slug,
              published_at: urlMatch.published_at
            }
          };
          duplicates++;
          return { ...article, duplicateInfo, selected: false };
        }

        // Check by slug
        const articleSlug = generateSlugFromTitle(article.title);
        const slugMatch = existingArticles?.find(
          existing => existing.slug === articleSlug
        );
        
        if (slugMatch) {
          duplicateInfo = {
            isDuplicate: true,
            matchType: 'slug',
            existingArticle: {
              id: slugMatch.id,
              title: slugMatch.title,
              slug: slugMatch.slug,
              published_at: slugMatch.published_at
            }
          };
          duplicates++;
          return { ...article, duplicateInfo, selected: false };
        }

        // Check by title similarity (>85%)
        for (const existing of existingArticles || []) {
          const similarity = calculateSimilarity(article.title, existing.title);
          if (similarity >= 0.85) {
            duplicateInfo = {
              isDuplicate: true,
              matchType: 'title',
              existingArticle: {
                id: existing.id,
                title: existing.title,
                slug: existing.slug,
                published_at: existing.published_at
              },
              similarity: Math.round(similarity * 100)
            };
            duplicates++;
            return { ...article, duplicateInfo, selected: false };
          }
        }

        return { ...article, duplicateInfo };
      });

      setDuplicatesCount(duplicates);
      return articlesWithDuplicateInfo;
    } catch (error) {
      console.error('[useDuplicateDetection] Error:', error);
      return articles;
    } finally {
      setIsChecking(false);
    }
  };

  const filterDuplicates = (articles: ArticleWithDuplicateInfo[]): ArticleWithDuplicateInfo[] => {
    return articles.filter(article => !article.duplicateInfo?.isDuplicate);
  };

  return {
    checkDuplicates,
    filterDuplicates,
    isChecking,
    duplicatesCount
  };
};
