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
      academy_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      academy_courses: {
        Row: {
          category_id: string | null
          content: Json | null
          created_at: string | null
          description: string | null
          duration: number | null
          enrollment_count: number | null
          featured_image: string | null
          id: string
          instructor_id: string | null
          is_featured: boolean | null
          level: string | null
          price: number | null
          published: boolean | null
          rating: number | null
          short_description: string | null
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          enrollment_count?: number | null
          featured_image?: string | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean | null
          level?: string | null
          price?: number | null
          published?: boolean | null
          rating?: number | null
          short_description?: string | null
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          enrollment_count?: number | null
          featured_image?: string | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean | null
          level?: string | null
          price?: number | null
          published?: boolean | null
          rating?: number | null
          short_description?: string | null
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "academy_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_enrollments: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          progress_percentage: number | null
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
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
      ads_library: {
        Row: {
          alt_text: string | null
          anunciante: string | null
          ativo: boolean | null
          created_at: string | null
          destino_url: string | null
          id: string
          img_url: string
          nome: string
          prioridade: number | null
          tipo: string
          updated_at: string | null
          validade_fim: string | null
          validade_inicio: string | null
        }
        Insert: {
          alt_text?: string | null
          anunciante?: string | null
          ativo?: boolean | null
          created_at?: string | null
          destino_url?: string | null
          id?: string
          img_url: string
          nome: string
          prioridade?: number | null
          tipo: string
          updated_at?: string | null
          validade_fim?: string | null
          validade_inicio?: string | null
        }
        Update: {
          alt_text?: string | null
          anunciante?: string | null
          ativo?: boolean | null
          created_at?: string | null
          destino_url?: string | null
          id?: string
          img_url?: string
          nome?: string
          prioridade?: number | null
          tipo?: string
          updated_at?: string | null
          validade_fim?: string | null
          validade_inicio?: string | null
        }
        Relationships: []
      }
      article_analytics: {
        Row: {
          article_id: string | null
          created_at: string | null
          date: string | null
          event_type: string | null
          id: string
          views: number | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          date?: string | null
          event_type?: string | null
          id?: string
          views?: number | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          date?: string | null
          event_type?: string | null
          id?: string
          views?: number | null
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
          approved: boolean | null
          article_id: string | null
          author_email: string | null
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          article_id?: string | null
          author_email?: string | null
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          article_id?: string | null
          author_email?: string | null
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      articles: {
        Row: {
          additional_images: Json | null
          author_id: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          featured_image_alt: string | null
          featured_image_credit: string | null
          featured_image_json: Json | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          published_at: string | null
          read_time: number | null
          slug: string
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          additional_images?: Json | null
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          featured_image_alt?: string | null
          featured_image_credit?: string | null
          featured_image_json?: Json | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          additional_images?: Json | null
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          featured_image_alt?: string | null
          featured_image_credit?: string | null
          featured_image_json?: Json | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
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
          author: string | null
          auto_publish: boolean | null
          category_id: string | null
          content: string | null
          created_at: string | null
          error_message: string | null
          excerpt: string | null
          featured_image: string | null
          feed_id: string | null
          id: string
          import_mode: string | null
          language: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          metadata: Json | null
          processed_at: string | null
          published_date: string | null
          read_time: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          rewrite_content: boolean | null
          source_name: string | null
          source_url: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          auto_publish?: boolean | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          excerpt?: string | null
          featured_image?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          language?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          metadata?: Json | null
          processed_at?: string | null
          published_date?: string | null
          read_time?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rewrite_content?: boolean | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          auto_publish?: boolean | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          error_message?: string | null
          excerpt?: string | null
          featured_image?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          language?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          metadata?: Json | null
          processed_at?: string | null
          published_date?: string | null
          read_time?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rewrite_content?: boolean | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
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
          created_at: string | null
          email: string | null
          id: string
          name: string
          slug: string
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          slug: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          slug?: string
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      available_permissions: {
        Row: {
          category: string
          created_at: string | null
          id: string
          permission_description: string | null
          permission_key: string
          permission_name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          permission_description?: string | null
          permission_key: string
          permission_name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          permission_description?: string | null
          permission_key?: string
          permission_name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          created_at: string | null
          documento: string
          email: string | null
          id: string
          logradouro: string | null
          municipio_ibge: number | null
          numero: string | null
          razao_social: string
          telefone: string | null
          tipo: string
          uf: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          created_at?: string | null
          documento: string
          email?: string | null
          id?: string
          logradouro?: string | null
          municipio_ibge?: number | null
          numero?: string | null
          razao_social: string
          telefone?: string | null
          tipo: string
          uf?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          created_at?: string | null
          documento?: string
          email?: string | null
          id?: string
          logradouro?: string | null
          municipio_ibge?: number | null
          numero?: string | null
          razao_social?: string
          telefone?: string | null
          tipo?: string
          uf?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          admin_email: string | null
          created_at: string | null
          database_schema: string | null
          domain: string | null
          id: string
          logo_url: string | null
          metadata: Json | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          created_at?: string | null
          database_schema?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          created_at?: string | null
          database_schema?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      communities: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_private: boolean | null
          member_count: number | null
          monthly_price: number | null
          name: string
          owner_id: string | null
          post_count: number | null
          settings: Json | null
          slug: string
          tags: string[] | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          member_count?: number | null
          monthly_price?: number | null
          name: string
          owner_id?: string | null
          post_count?: number | null
          settings?: Json | null
          slug: string
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          member_count?: number | null
          monthly_price?: number | null
          name?: string
          owner_id?: string | null
          post_count?: number | null
          settings?: Json | null
          slug?: string
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          community_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          community_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
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
      community_posts: {
        Row: {
          author_id: string | null
          comment_count: number | null
          community_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          media_urls: string[] | null
          poll_options: Json | null
          reaction_count: number | null
          share_count: number | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          comment_count?: number | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          media_urls?: string[] | null
          poll_options?: Json | null
          reaction_count?: number | null
          share_count?: number | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          comment_count?: number | null
          community_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          media_urls?: string[] | null
          poll_options?: Json | null
          reaction_count?: number | null
          share_count?: number | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      edition_analytics: {
        Row: {
          created_at: string | null
          edition_id: string
          event_type: string
          id: string
          ip_address: string | null
          pagina: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          edition_id: string
          event_type: string
          id?: string
          ip_address?: string | null
          pagina?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          edition_id?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          pagina?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edition_analytics_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      edition_items: {
        Row: {
          configuracao_json: Json | null
          created_at: string | null
          edition_id: string
          id: string
          layout_hint: string | null
          ordem: number
          pagina_alvo: number | null
          referencia_id: string | null
          secao: string | null
          tipo: string
        }
        Insert: {
          configuracao_json?: Json | null
          created_at?: string | null
          edition_id: string
          id?: string
          layout_hint?: string | null
          ordem: number
          pagina_alvo?: number | null
          referencia_id?: string | null
          secao?: string | null
          tipo: string
        }
        Update: {
          configuracao_json?: Json | null
          created_at?: string | null
          edition_id?: string
          id?: string
          layout_hint?: string | null
          ordem?: number
          pagina_alvo?: number | null
          referencia_id?: string | null
          secao?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "edition_items_edition_id_fkey"
            columns: ["edition_id"]
            isOneToOne: false
            referencedRelation: "editions"
            referencedColumns: ["id"]
          },
        ]
      }
      editions: {
        Row: {
          acessibilidade_json: Json | null
          capa_json: Json | null
          cidade: string | null
          colunas: number | null
          created_at: string | null
          created_by: string | null
          data_publicacao: string
          downloads_epub: number | null
          downloads_pdf: number | null
          fonte_base: string | null
          id: string
          interlinha: number | null
          margem: string | null
          numero_edicao: string
          seo_json: Json | null
          slug: string
          status: string | null
          subtitulo: string | null
          sumario_json: Json | null
          tamanho_fonte_base: number | null
          tema_visual: string | null
          titulo: string
          total_paginas: number | null
          uf: string | null
          updated_at: string | null
          visualizacoes: number | null
        }
        Insert: {
          acessibilidade_json?: Json | null
          capa_json?: Json | null
          cidade?: string | null
          colunas?: number | null
          created_at?: string | null
          created_by?: string | null
          data_publicacao: string
          downloads_epub?: number | null
          downloads_pdf?: number | null
          fonte_base?: string | null
          id?: string
          interlinha?: number | null
          margem?: string | null
          numero_edicao: string
          seo_json?: Json | null
          slug: string
          status?: string | null
          subtitulo?: string | null
          sumario_json?: Json | null
          tamanho_fonte_base?: number | null
          tema_visual?: string | null
          titulo: string
          total_paginas?: number | null
          uf?: string | null
          updated_at?: string | null
          visualizacoes?: number | null
        }
        Update: {
          acessibilidade_json?: Json | null
          capa_json?: Json | null
          cidade?: string | null
          colunas?: number | null
          created_at?: string | null
          created_by?: string | null
          data_publicacao?: string
          downloads_epub?: number | null
          downloads_pdf?: number | null
          fonte_base?: string | null
          id?: string
          interlinha?: number | null
          margem?: string | null
          numero_edicao?: string
          seo_json?: Json | null
          slug?: string
          status?: string | null
          subtitulo?: string | null
          sumario_json?: Json | null
          tamanho_fonte_base?: number | null
          tema_visual?: string | null
          titulo?: string
          total_paginas?: number | null
          uf?: string | null
          updated_at?: string | null
          visualizacoes?: number | null
        }
        Relationships: []
      }
      feed_test_results: {
        Row: {
          articles_found: number | null
          created_at: string | null
          error_message: string | null
          feed_id: string | null
          id: string
          items_found: number | null
          response_time_ms: number | null
          status: string | null
          test_date: string | null
          tested_at: string | null
        }
        Insert: {
          articles_found?: number | null
          created_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          id?: string
          items_found?: number | null
          response_time_ms?: number | null
          status?: string | null
          test_date?: string | null
          tested_at?: string | null
        }
        Update: {
          articles_found?: number | null
          created_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          id?: string
          items_found?: number | null
          response_time_ms?: number | null
          status?: string | null
          test_date?: string | null
          tested_at?: string | null
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
      import_logs: {
        Row: {
          articles_imported: number | null
          completed_at: string | null
          error_message: string | null
          feed_id: string | null
          id: string
          import_mode: string | null
          imported_at: string | null
          items_imported: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          articles_imported?: number | null
          completed_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          imported_at?: string | null
          items_imported?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          articles_imported?: number | null
          completed_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          id?: string
          import_mode?: string | null
          imported_at?: string | null
          items_imported?: number | null
          started_at?: string | null
          status?: string | null
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
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          stream_type: string | null
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          viewer_count: number | null
        }
        Insert: {
          chat_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          stream_type?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Update: {
          chat_enabled?: boolean | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          stream_type?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          content_type: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean | null
          media_type: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean | null
          media_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          media_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      menu_configurations: {
        Row: {
          config_type: string
          created_at: string
          id: string
          menu_data: Json
          updated_at: string
        }
        Insert: {
          config_type: string
          created_at?: string
          id?: string
          menu_data?: Json
          updated_at?: string
        }
        Update: {
          config_type?: string
          created_at?: string
          id?: string
          menu_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          active: boolean | null
          confirmed: boolean | null
          created_at: string | null
          email: string
          id: string
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          confirmed?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          confirmed?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nfse_arquivos: {
        Row: {
          criado_em: string | null
          id: string
          nota_id: string
          path: string
          tipo: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          nota_id: string
          path: string
          tipo: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          nota_id?: string
          path?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfse_arquivos_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "nfse_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      nfse_logs: {
        Row: {
          acao: string
          criado_em: string | null
          detalhe: string | null
          id: string
          ip: string | null
          nota_id: string | null
          perfil_id: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          criado_em?: string | null
          detalhe?: string | null
          id?: string
          ip?: string | null
          nota_id?: string | null
          perfil_id?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          criado_em?: string | null
          detalhe?: string | null
          id?: string
          ip?: string | null
          nota_id?: string | null
          perfil_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfse_logs_nota_id_fkey"
            columns: ["nota_id"]
            isOneToOne: false
            referencedRelation: "nfse_notas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfse_logs_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "nfse_perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      nfse_notas: {
        Row: {
          atualizado_em: string | null
          cliente_id: string | null
          codigo_verificacao: string | null
          criado_em: string | null
          discriminacao: string
          id: string
          numero_nfse: string | null
          pdf_path: string | null
          perfil_id: string
          retorno_bruto: string | null
          rps_numero: number
          rps_serie: string
          situacao: string
          valor_servicos: number
          xml_path: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cliente_id?: string | null
          codigo_verificacao?: string | null
          criado_em?: string | null
          discriminacao: string
          id?: string
          numero_nfse?: string | null
          pdf_path?: string | null
          perfil_id: string
          retorno_bruto?: string | null
          rps_numero: number
          rps_serie: string
          situacao?: string
          valor_servicos: number
          xml_path?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cliente_id?: string | null
          codigo_verificacao?: string | null
          criado_em?: string | null
          discriminacao?: string
          id?: string
          numero_nfse?: string | null
          pdf_path?: string | null
          perfil_id?: string
          retorno_bruto?: string | null
          rps_numero?: number
          rps_serie?: string
          situacao?: string
          valor_servicos?: number
          xml_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfse_notas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfse_notas_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "nfse_perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      nfse_perfis: {
        Row: {
          aliquota: number
          ambiente: string
          ativo: boolean
          cnae: string | null
          created_at: string | null
          endpoint: string | null
          id: string
          im: string
          incentivador: number
          iss_retido: number
          item_lista: string
          municipio_ibge: number
          natureza: number
          nome: string
          optante_simples: number
          prestador_cnpj: string
          prestador_fantasia: string | null
          prestador_im: string
          prestador_razao: string
          provedor: string
          rps_serie: string
          token: string | null
          updated_at: string | null
        }
        Insert: {
          aliquota?: number
          ambiente?: string
          ativo?: boolean
          cnae?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          im: string
          incentivador?: number
          iss_retido?: number
          item_lista?: string
          municipio_ibge?: number
          natureza?: number
          nome: string
          optante_simples?: number
          prestador_cnpj: string
          prestador_fantasia?: string | null
          prestador_im: string
          prestador_razao: string
          provedor: string
          rps_serie?: string
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          aliquota?: number
          ambiente?: string
          ativo?: boolean
          cnae?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          im?: string
          incentivador?: number
          iss_retido?: number
          item_lista?: string
          municipio_ibge?: number
          natureza?: number
          nome?: string
          optante_simples?: number
          prestador_cnpj?: string
          prestador_fantasia?: string | null
          prestador_im?: string
          prestador_razao?: string
          provedor?: string
          rps_serie?: string
          token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      nfse_rps_sequencia: {
        Row: {
          perfil_id: string
          proximo_numero: number
          serie: string
        }
        Insert: {
          perfil_id: string
          proximo_numero?: number
          serie: string
        }
        Update: {
          perfil_id?: string
          proximo_numero?: number
          serie?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfse_rps_sequencia_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "nfse_perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_integrations: {
        Row: {
          access_token: string | null
          active: boolean | null
          channel_id: string | null
          channel_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          platform: string | null
          platform_name: string
          refresh_token: string | null
          settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          active?: boolean | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform?: string | null
          platform_name: string
          refresh_token?: string | null
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          active?: boolean | null
          channel_id?: string | null
          channel_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform?: string | null
          platform_name?: string
          refresh_token?: string | null
          settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          name: string | null
          social_links: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          name?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          active: boolean | null
          created_at: string | null
          device_info: Json | null
          fcm_token: string
          id: string
          last_used_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          fcm_token: string
          id?: string
          last_used_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          fcm_token?: string
          id?: string
          last_used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "available_permissions"
            referencedColumns: ["permission_key"]
          },
        ]
      }
      rss_feeds: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          id: string
          is_native: boolean | null
          last_fetched: string | null
          name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_native?: boolean | null
          last_fetched?: string | null
          name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_native?: boolean | null
          last_fetched?: string | null
          name?: string
          updated_at?: string | null
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
      sections_library: {
        Row: {
          ativo: boolean | null
          cor: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem: number
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      site_ads: {
        Row: {
          active: boolean | null
          ad_code: string | null
          created_at: string | null
          id: string
          name: string
          position: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          ad_code?: string | null
          created_at?: string | null
          id?: string
          name: string
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          ad_code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_banners: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          image_url: string | null
          link_url: string | null
          position: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          position?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      site_statistics: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          metric_name: string
          metric_value: number | null
          recorded_date: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          metric_name: string
          metric_value?: number | null
          recorded_date?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          recorded_date?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      webstories: {
        Row: {
          author_id: string | null
          created_at: string | null
          description: string | null
          id: string
          published: boolean | null
          publisher_logo: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published?: boolean | null
          publisher_logo?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published?: boolean | null
          publisher_logo?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webstories_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      webstory_pages: {
        Row: {
          background_color: string | null
          background_image: string | null
          content: Json | null
          created_at: string | null
          id: string
          page_number: number
          webstory_id: string | null
        }
        Insert: {
          background_color?: string | null
          background_image?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          page_number: number
          webstory_id?: string | null
        }
        Update: {
          background_color?: string | null
          background_image?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          page_number?: number
          webstory_id?: string | null
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
      get_clients_menu: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { role_name: string; uid: string }
        Returns: boolean
      }
      is_illumina_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      upsert_client: {
        Args: {
          p_admin_email: string
          p_domain: string
          p_logo_url?: string
          p_name: string
          p_primary_color?: string
          p_secondary_color?: string
          p_slug: string
          p_status?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "author" | "user" | "superadmin"
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
      app_role: ["admin", "editor", "author", "user", "superadmin"],
    },
  },
} as const
