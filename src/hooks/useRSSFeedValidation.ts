import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { validateRSSFeed, type FeedValidationResult } from "@/constants/rssFeeds";

export interface FeedWithValidation {
  id: string;
  name: string;
  url: string;
  is_native: boolean;
  active: boolean;
  validation: FeedValidationResult;
}

export const useRSSFeedValidation = () => {
  return useQuery({
    queryKey: ['rss-feed-validation'],
    queryFn: async (): Promise<FeedWithValidation[]> => {
      const { data: feeds, error } = await supabase
        .from('rss_feeds')
        .select('id, name, url, is_native, active')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch feeds for validation: ${error.message}`);
      }

      // Validate each feed
      const validatedFeeds = feeds.map(feed => ({
        ...feed,
        validation: validateRSSFeed(
          feed.name,
          feed.url, 
          feed.is_native,
          feeds.filter(f => f.id !== feed.id)
        )
      }));

      return validatedFeeds;
    },
  });
};

export const useFeedDuplicates = () => {
  const { data: validatedFeeds } = useRSSFeedValidation();
  
  return {
    duplicates: validatedFeeds?.filter(feed => feed.validation.isDuplicate) || [],
    invalidCategories: validatedFeeds?.filter(feed => !feed.validation.isValidCategory) || [],
    totalIssues: validatedFeeds?.filter(feed => 
      feed.validation.isDuplicate || !feed.validation.isValidCategory
    ).length || 0
  };
};