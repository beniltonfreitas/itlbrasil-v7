export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academy_achievements: {
        Row: {
          badge_color: string | null
          created_at: string
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number | null
        }
        Insert: {
          badge_color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required?: number | null
        }
        Update: {
          badge_color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      academy_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      academy_certificates: {
        Row: {
          certificate_number: string
          certificate_url: string | null
          course_id: string
          id: string
          issued_at: string
          student_id: string
        }
        Insert: {
          certificate_number: string
          certificate_url?: string | null
          course_id: string
          id?: string
          issued_at?: string
          student_id: string
        }
        Update: {
          certificate_number?: string
          certificate_url?: string | null
          course_id?: string
          id?: string
          issued_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          upvotes: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          upvotes?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "academy_community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academy_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_community_posts: {
        Row: {
          author_id: string
          content: string
          course_id: string | null
          created_at: string
          id: string
          poll_options: Json | null
          post_type: string | null
          title: string | null
          updated_at: string
          upvotes: number | null
        }
        Insert: {
          author_id: string
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          poll_options?: Json | null
          post_type?: string | null
          title?: string | null
          updated_at?: string
          upvotes?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          poll_options?: Json | null
          post_type?: string | null
          title?: string | null
          updated_at?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_community_posts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_courses: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration: number | null
          enrollment_count: number | null
          featured_image: string | null
          id: string
          instructor_id: string | null
          is_featured: boolean | null
          level: string | null
          price: number | null
          rating: number | null
          short_description: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          enrollment_count?: number | null
          featured_image?: string | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean | null
          level?: string | null
          price?: number | null
          rating?: number | null
          short_description?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          enrollment_count?: number | null
          featured_image?: string | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean | null
          level?: string | null
          price?: number | null
          rating?: number | null
          short_description?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "academy_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_ebooks: {
        Row: {
          author_id: string | null
          category_id: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_size: number | null
          file_url: string
          id: string
          price: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          price?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          price?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_ebooks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "academy_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_percentage: number | null
          status: string | null
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          status?: string | null
          student_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_percentage?: number | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          duration: number | null
          id: string
          is_preview: boolean | null
          lesson_type: string | null
          order_index: number | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_type?: string | null
          order_index?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          is_preview?: boolean | null
          lesson_type?: string | null
          order_index?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_mentorships: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          duration: number | null
          id: string
          meeting_url: string | null
          mentor_id: string
          replay_url: string | null
          scheduled_at: string
          status: string | null
          student_id: string | null
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          meeting_url?: string | null
          mentor_id: string
          replay_url?: string | null
          scheduled_at: string
          status?: string | null
          student_id?: string | null
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          meeting_url?: string | null
          mentor_id?: string
          replay_url?: string | null
          scheduled_at?: string
          status?: string | null
          student_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_mentorships_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_progress: {
        Row: {
          completed_at: string | null
          enrollment_id: string
          id: string
          lesson_id: string
          status: string | null
          watch_time: number | null
        }
        Insert: {
          completed_at?: string | null
          enrollment_id: string
          id?: string
          lesson_id: string
          status?: string | null
          watch_time?: number | null
        }
        Update: {
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          lesson_id?: string
          status?: string | null
          watch_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "academy_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_quiz_attempts: {
        Row: {
          answers: Json | null
          attempt_number: number | null
          completed_at: string | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number | null
          student_id: string
        }
        Insert: {
          answers?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          student_id: string
        }
        Update: {
          answers?: Json | null
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "academy_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_quizzes: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          lesson_id: string | null
          max_attempts: number | null
          passing_score: number | null
          questions: Json | null
          time_limit: number | null
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json | null
          time_limit?: number | null
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number | null
          questions?: Json | null
          time_limit?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_sales: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          item_id: string
          item_type: string
          payment_method: string | null
          payment_status: string | null
          student_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          item_id: string
          item_type: string
          payment_method?: string | null
          payment_status?: string | null
          student_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          item_id?: string
          item_type?: string
          payment_method?: string | null
          payment_status?: string | null
          student_id?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      article_analytics: {
        Row: {
          article_id: string
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
          source: string | null
          user_agent: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_comments: {
        Row: {
          article_id: string
          author_email: string
          author_name: string
          content: string
          created_at: string
          id: string
          ip_address: unknown
          parent_id: string | null
          status: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          article_id: string
          author_email: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          ip_address?: unknown
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          article_id?: string
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      article_versions: {
        Row: {
          article_id: string
          changes_description: string | null
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          title: string
          version_number: number
        }
        Insert: {
          article_id: string
          changes_description?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          title: string
          version_number?: number
        }
        Update: {
          article_id?: string
          changes_description?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          additional_images: Json | null
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          featured_image_alt: string | null
          featured_image_credit: string | null
          featured_image_json: Json | null
          id: string
          import_mode: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          published_at: string | null
          read_time: number | null
          scheduled_at: string | null
          shares_count: number | null
          slug: string
          source_name: string | null
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          additional_images?: Json | null
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          featured_image_alt?: string | null
          featured_image_credit?: string | null
          featured_image_json?: Json | null
          id?: string
          import_mode?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          scheduled_at?: string | null
          shares_count?: number | null
          slug: string
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          additional_images?: Json | null
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          featured_image_alt?: string | null
          featured_image_credit?: string | null
          featured_image_json?: Json | null
          id?: string
          import_mode?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          scheduled_at?: string | null
          shares_count?: number | null
          slug?: string
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      articles_queue: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          feed_id: string | null
          id: string
          import_mode: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          read_time: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_name: string | null
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          read_time?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          read_time?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_queue_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_queue_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          slug: string
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          slug: string
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          slug?: string
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          cover_image: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          member_count: number | null
          monthly_price: number | null
          name: string
          post_count: number | null
          settings: Json | null
          slug: string
          type: Database["public"]["Enums"]["community_type"]
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number | null
          monthly_price?: number | null
          name: string
          post_count?: number | null
          settings?: Json | null
          slug: string
          type?: Database["public"]["Enums"]["community_type"]
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number | null
          monthly_price?: number | null
          name?: string
          post_count?: number | null
          settings?: Json | null
          slug?: string
          type?: Database["public"]["Enums"]["community_type"]
          updated_at?: string
        }
        Relationships: []
      }
      community_achievements: {
        Row: {
          badge_color: string | null
          created_at: string
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number | null
        }
        Insert: {
          badge_color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required?: number | null
        }
        Update: {
          badge_color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      community_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          reaction_count: number | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          reaction_count?: number | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          reaction_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_event_attendees: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          community_id: string
          cover_image: string | null
          created_at: string
          created_by: string | null
          current_attendees: number | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_online: boolean | null
          location: string | null
          max_attendees: number | null
          price: number | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          community_id: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          price?: number | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          price?: number | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          is_active: boolean
          joined_at: string
          level: number | null
          points: number | null
          role: Database["public"]["Enums"]["community_member_role"]
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          level?: number | null
          points?: number | null
          role?: Database["public"]["Enums"]["community_member_role"]
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          level?: number | null
          points?: number | null
          role?: Database["public"]["Enums"]["community_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_notifications: {
        Row: {
          community_id: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_notifications_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comment_count: number | null
          community_id: string
          content: string
          created_at: string
          id: string
          is_featured: boolean | null
          is_pinned: boolean | null
          media_urls: string[] | null
          poll_options: Json | null
          reaction_count: number | null
          share_count: number | null
          title: string | null
          type: Database["public"]["Enums"]["community_post_type"]
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id: string
          comment_count?: number | null
          community_id: string
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_pinned?: boolean | null
          media_urls?: string[] | null
          poll_options?: Json | null
          reaction_count?: number | null
          share_count?: number | null
          title?: string | null
          type?: Database["public"]["Enums"]["community_post_type"]
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string
          comment_count?: number | null
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_pinned?: boolean | null
          media_urls?: string[] | null
          poll_options?: Json | null
          reaction_count?: number | null
          share_count?: number | null
          title?: string | null
          type?: Database["public"]["Enums"]["community_post_type"]
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_reactions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_test_results: {
        Row: {
          articles_found: number | null
          content_preview: string | null
          created_at: string
          error_message: string | null
          feed_id: string
          http_status: number | null
          id: string
          last_article_date: string | null
          response_time_ms: number | null
          status: string
          test_date: string
        }
        Insert: {
          articles_found?: number | null
          content_preview?: string | null
          created_at?: string
          error_message?: string | null
          feed_id: string
          http_status?: number | null
          id?: string
          last_article_date?: string | null
          response_time_ms?: number | null
          status: string
          test_date?: string
        }
        Update: {
          articles_found?: number | null
          content_preview?: string | null
          created_at?: string
          error_message?: string | null
          feed_id?: string
          http_status?: number | null
          id?: string
          last_article_date?: string | null
          response_time_ms?: number | null
          status?: string
          test_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_test_results_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      image_credits: {
        Row: {
          article_id: string
          created_at: string
          credit_text: string
          credit_url: string | null
          id: string
          image_url: string
          position: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          credit_text: string
          credit_url?: string | null
          id?: string
          image_url: string
          position?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          credit_text?: string
          credit_url?: string | null
          id?: string
          image_url?: string
          position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_credits_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          articles_imported: number | null
          completed_at: string | null
          error_message: string | null
          feed_id: string | null
          id: string
          import_mode: string | null
          started_at: string
          status: string
        }
        Insert: {
          articles_imported?: number | null
          completed_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          started_at?: string
          status: string
        }
        Update: {
          articles_imported?: number | null
          completed_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_logs_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          chat_enabled: boolean | null
          created_at: string
          description: string | null
          embed_code: string | null
          id: string
          scheduled_end: string | null
          scheduled_start: string | null
          status: string
          stream_type: string
          stream_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewer_count: number | null
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string
          description?: string | null
          embed_code?: string | null
          id?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string
          stream_type: string
          stream_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewer_count?: number | null
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string
          description?: string | null
          embed_code?: string | null
          id?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string
          stream_type?: string
          stream_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewer_count?: number | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          category: string | null
          content_type: string
          created_at: string
          description: string | null
          duration: number | null
          file_size: number | null
          file_url: string
          id: string
          is_public: boolean | null
          media_type: string
          published_at: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          view_count: number | null
          youtube_channel_id: string | null
          youtube_channel_name: string | null
          youtube_video_id: string | null
        }
        Insert: {
          category?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_url: string
          id?: string
          is_public?: boolean | null
          media_type: string
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
          youtube_channel_id?: string | null
          youtube_channel_name?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          category?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          media_type?: string
          published_at?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
          youtube_channel_id?: string | null
          youtube_channel_name?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_library_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      menu_permissions: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          menu_item: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          menu_item: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          menu_item?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          active: boolean | null
          confirmation_token: string | null
          confirmed: boolean | null
          email: string
          id: string
          preferences: Json | null
          subscribed_at: string
        }
        Insert: {
          active?: boolean | null
          confirmation_token?: string | null
          confirmed?: boolean | null
          email: string
          id?: string
          preferences?: Json | null
          subscribed_at?: string
        }
        Update: {
          active?: boolean | null
          confirmation_token?: string | null
          confirmed?: boolean | null
          email?: string
          id?: string
          preferences?: Json | null
          subscribed_at?: string
        }
        Relationships: []
      }
      platform_integrations: {
        Row: {
          access_token: string | null
          active: boolean | null
          channel_id: string | null
          channel_name: string | null
          created_at: string | null
          id: string
          platform: string
          refresh_token: string | null
          settings: Json | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          active?: boolean | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          id?: string
          platform: string
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          active?: boolean | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          id?: string
          platform?: string
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_integrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          name: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_schedule: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          host_name: string | null
          id: string
          is_active: boolean | null
          program_type: string
          recurring_pattern: string | null
          start_time: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          host_name?: string | null
          id?: string
          is_active?: boolean | null
          program_type: string
          recurring_pattern?: string | null
          start_time: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          host_name?: string | null
          id?: string
          is_active?: boolean | null
          program_type?: string
          recurring_pattern?: string | null
          start_time?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      rss_feeds: {
        Row: {
          active: boolean | null
          auto_publish: boolean | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          import_interval: number | null
          import_mode: string | null
          is_native: boolean | null
          last_import: string | null
          max_articles_per_import: number | null
          min_content_length: number | null
          min_title_length: number | null
          name: string
          require_image: boolean | null
          review_queue: boolean | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean | null
          auto_publish?: boolean | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          import_interval?: number | null
          import_mode?: string | null
          is_native?: boolean | null
          last_import?: string | null
          max_articles_per_import?: number | null
          min_content_length?: number | null
          min_title_length?: number | null
          name: string
          require_image?: boolean | null
          review_queue?: boolean | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean | null
          auto_publish?: boolean | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          import_interval?: number | null
          import_mode?: string | null
          is_native?: boolean | null
          last_import?: string | null
          max_articles_per_import?: number | null
          min_content_length?: number | null
          min_title_length?: number | null
          name?: string
          require_image?: boolean | null
          review_queue?: boolean | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "rss_feeds_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          join_token: string | null
          joined_at: string | null
          left_at: string | null
          name: string
          peer_id: string | null
          permissions: Json | null
          role: string | null
          session_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          join_token?: string | null
          joined_at?: string | null
          left_at?: string | null
          name: string
          peer_id?: string | null
          permissions?: Json | null
          role?: string | null
          session_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          join_token?: string | null
          joined_at?: string | null
          left_at?: string | null
          name?: string
          peer_id?: string | null
          permissions?: Json | null
          role?: string | null
          session_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "studio_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      site_banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          order_index: number
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          order_index?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          order_index?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      site_statistics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: Json
          recorded_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: Json
          recorded_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: Json
          recorded_date?: string
        }
        Relationships: []
      }
      social_analytics: {
        Row: {
          created_at: string | null
          id: string
          metric_type: string
          metric_value: number | null
          platform: Database["public"]["Enums"]["social_platform"]
          post_id: string | null
          recorded_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_type: string
          metric_value?: number | null
          platform: Database["public"]["Enums"]["social_platform"]
          post_id?: string | null
          recorded_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          platform?: Database["public"]["Enums"]["social_platform"]
          post_id?: string | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_campaigns: {
        Row: {
          budget: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          target_platforms:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          target_platforms?:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          target_platforms?:
            | Database["public"]["Enums"]["social_platform"][]
            | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_comments: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          author_username: string | null
          content: string
          created_at: string | null
          id: string
          is_replied: boolean | null
          parent_comment_id: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          platform_comment_id: string
          post_id: string | null
          replied_at: string | null
          reply_content: string | null
          sentiment: string | null
        }
        Insert: {
          author_avatar_url?: string | null
          author_name: string
          author_username?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_replied?: boolean | null
          parent_comment_id?: string | null
          platform: Database["public"]["Enums"]["social_platform"]
          platform_comment_id: string
          post_id?: string | null
          replied_at?: string | null
          reply_content?: string | null
          sentiment?: string | null
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          author_username?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_replied?: boolean | null
          parent_comment_id?: string | null
          platform?: Database["public"]["Enums"]["social_platform"]
          platform_comment_id?: string
          post_id?: string | null
          replied_at?: string | null
          reply_content?: string | null
          sentiment?: string | null
        }
        Relationships: []
      }
      social_media_accounts: {
        Row: {
          access_token: string | null
          account_id: string
          account_name: string
          created_at: string | null
          follower_count: number | null
          id: string
          is_active: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_image_url: string | null
          refresh_token: string | null
          settings: Json | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          account_id: string
          account_name: string
          created_at?: string | null
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          platform: Database["public"]["Enums"]["social_platform"]
          profile_image_url?: string | null
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          account_id?: string
          account_name?: string
          created_at?: string | null
          follower_count?: number | null
          id?: string
          is_active?: boolean | null
          platform?: Database["public"]["Enums"]["social_platform"]
          profile_image_url?: string | null
          refresh_token?: string | null
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_media_library: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          file_size: number | null
          file_type: string
          file_url: string
          folder: string | null
          height: number | null
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          folder?: string | null
          height?: number | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          folder?: string | null
          height?: number | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          ai_generated: boolean | null
          campaign_id: string | null
          content: string
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string | null
          engagement_stats: Json | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          platform_post_ids: Json | null
          platforms: Database["public"]["Enums"]["social_platform"][]
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          campaign_id?: string | null
          content: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          engagement_stats?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform_post_ids?: Json | null
          platforms: Database["public"]["Enums"]["social_platform"][]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          campaign_id?: string | null
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          engagement_stats?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          platform_post_ids?: Json | null
          platforms?: Database["public"]["Enums"]["social_platform"][]
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_social_posts_campaign"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "social_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          platform: string | null
          session_id: string | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          platform?: string | null
          session_id?: string | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          platform?: string | null
          session_id?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "studio_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_recordings: {
        Row: {
          created_at: string | null
          duration: number | null
          file_size: number | null
          file_url: string
          format: string | null
          id: string
          quality: string | null
          session_id: string | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          file_url: string
          format?: string | null
          id?: string
          quality?: string | null
          session_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          file_url?: string
          format?: string | null
          id?: string
          quality?: string | null
          session_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "studio_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_sessions: {
        Row: {
          chat_enabled: boolean | null
          created_at: string | null
          created_by: string | null
          ended_at: string | null
          id: string
          layout_type: string | null
          mode: string
          participants: Json | null
          recording_enabled: boolean | null
          settings: Json | null
          started_at: string | null
          status: string
          stream_key: string | null
          title: string
          updated_at: string | null
          viewer_count: number | null
          youtube_stream_id: string | null
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          id?: string
          layout_type?: string | null
          mode: string
          participants?: Json | null
          recording_enabled?: boolean | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          stream_key?: string | null
          title: string
          updated_at?: string | null
          viewer_count?: number | null
          youtube_stream_id?: string | null
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          ended_at?: string | null
          id?: string
          layout_type?: string | null
          mode?: string
          participants?: Json | null
          recording_enabled?: boolean | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          stream_key?: string | null
          title?: string
          updated_at?: string | null
          viewer_count?: number | null
          youtube_stream_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_academy_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_academy_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "academy_achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          community_id: string | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          community_id?: string | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          community_id?: string | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "community_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webstories: {
        Row: {
          author_id: string | null
          cover_image: string | null
          created_at: string
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          slug: string
          source_article_id: string | null
          status: string
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          cover_image?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          slug: string
          source_article_id?: string | null
          status?: string
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          cover_image?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          slug?: string
          source_article_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webstories_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webstories_source_article_id_fkey"
            columns: ["source_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      webstory_pages: {
        Row: {
          background_color: string | null
          content_data: Json
          content_type: string
          created_at: string
          font_family: string | null
          id: string
          page_number: number
          text_color: string | null
          webstory_id: string
        }
        Insert: {
          background_color?: string | null
          content_data?: Json
          content_type: string
          created_at?: string
          font_family?: string | null
          id?: string
          page_number: number
          text_color?: string | null
          webstory_id: string
        }
        Update: {
          background_color?: string | null
          content_data?: Json
          content_type?: string
          created_at?: string
          font_family?: string | null
          id?: string
          page_number?: number
          text_color?: string | null
          webstory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webstory_pages_webstory_id_fkey"
            columns: ["webstory_id"]
            isOneToOne: false
            referencedRelation: "webstories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_logs: { Args: never; Returns: undefined }
      collect_daily_statistics: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "editor" | "author"
      community_member_role: "admin" | "moderator" | "member" | "vip"
      community_post_type: "text" | "image" | "video" | "poll" | "event"
      community_type: "public" | "private" | "paid" | "secret"
      content_type: "text" | "image" | "video" | "carousel" | "story" | "reel"
      post_status: "draft" | "scheduled" | "published" | "failed" | "cancelled"
      reaction_type:
        | "like"
        | "love"
        | "support"
        | "star"
        | "celebrate"
        | "angry"
      social_platform:
        | "instagram"
        | "facebook"
        | "linkedin"
        | "youtube"
        | "tiktok"
        | "twitter"
        | "google_business"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "admin", "editor", "author"],
      community_member_role: ["admin", "moderator", "member", "vip"],
      community_post_type: ["text", "image", "video", "poll", "event"],
      community_type: ["public", "private", "paid", "secret"],
      content_type: ["text", "image", "video", "carousel", "story", "reel"],
      post_status: ["draft", "scheduled", "published", "failed", "cancelled"],
      reaction_type: ["like", "love", "support", "star", "celebrate", "angry"],
      social_platform: [
        "instagram",
        "facebook",
        "linkedin",
        "youtube",
        "tiktok",
        "twitter",
        "google_business",
      ],
    },
  },
} as const
