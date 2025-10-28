export interface WebStory {
  id: string;
  title: string;
  slug: string;
  cover_image?: string;
  status: 'draft' | 'published';
  author_id?: string;
  created_at: string;
  updated_at: string;
  meta_description?: string;
  meta_keywords?: string[];
  source_article_id?: string;
  views_count: number;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface WebStoryPage {
  id: string;
  webstory_id: string;
  page_number: number;
  content_type: 'text' | 'image' | 'video';
  content_data: {
    text?: string;
    image_url?: string;
    video_url?: string;
    caption?: string;
  };
  background_color: string;
  text_color: string;
  font_family: string;
  created_at: string;
}

export interface CreateWebStoryData {
  title: string;
  slug: string;
  cover_image?: string;
  status?: 'draft' | 'published';
  author_id?: string;
  meta_description?: string;
  meta_keywords?: string[];
  source_article_id?: string;
}

export interface UpdateWebStoryData extends Partial<CreateWebStoryData> {
  id: string;
}

export interface CreateWebStoryPageData {
  webstory_id: string;
  page_number: number;
  content_type: 'text' | 'image' | 'video';
  content_data: {
    text?: string;
    image_url?: string;
    video_url?: string;
    caption?: string;
  };
  background_color?: string;
  text_color?: string;
  font_family?: string;
}

export interface UpdateWebStoryPageData extends Partial<CreateWebStoryPageData> {
  id: string;
}