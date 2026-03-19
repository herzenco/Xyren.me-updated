export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          category: string
          excerpt: string
          content: string
          author: string
          cover_image: string | null
          tags: string[] | null
          reading_time: number | null
          published_at: string | null
          updated_at: string
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          category: string
          excerpt: string
          content: string
          author?: string
          cover_image?: string | null
          tags?: string[] | null
          reading_time?: number | null
          published_at?: string | null
          updated_at?: string
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          category?: string
          excerpt?: string
          content?: string
          author?: string
          cover_image?: string | null
          tags?: string[] | null
          reading_time?: number | null
          published_at?: string | null
          updated_at?: string
          is_published?: boolean
          created_at?: string
        }
      }
      how_to_guides: {
        Row: {
          id: string
          title: string
          slug: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          excerpt: string
          content: string
          cover_image: string | null
          tags: string[] | null
          reading_time: number | null
          published_at: string | null
          updated_at: string
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          excerpt: string
          content: string
          cover_image?: string | null
          tags?: string[] | null
          reading_time?: number | null
          published_at?: string | null
          updated_at?: string
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          excerpt?: string
          content?: string
          cover_image?: string | null
          tags?: string[] | null
          reading_time?: number | null
          published_at?: string | null
          updated_at?: string
          is_published?: boolean
          created_at?: string
        }
      }
      faq_items: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          sort_order: number
          is_published: boolean
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category: string
          sort_order?: number
          is_published?: boolean
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string
          sort_order?: number
          is_published?: boolean
          updated_at?: string
          created_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          business: string | null
          service: string | null
          message: string
          status: 'new' | 'reviewed' | 'archived'
          clickup_status: 'pending' | 'synced' | 'sync_failed'
          clickup_task_id: string | null
          clickup_error: string | null
          synced_at: string | null
          retry_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          business?: string | null
          service?: string | null
          message: string
          status?: 'new' | 'reviewed' | 'archived'
          clickup_status?: 'pending' | 'synced' | 'sync_failed'
          clickup_task_id?: string | null
          clickup_error?: string | null
          synced_at?: string | null
          retry_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          business?: string | null
          service?: string | null
          message?: string
          status?: 'new' | 'reviewed' | 'archived'
          clickup_status?: 'pending' | 'synced' | 'sync_failed'
          clickup_task_id?: string | null
          clickup_error?: string | null
          synced_at?: string | null
          retry_count?: number
          created_at?: string
        }
      }
      content_drafts: {
        Row: {
          id: string
          type: 'blog' | 'how-to'
          title: string
          slug: string | null
          excerpt: string | null
          content: string | null
          cover_image_url: string | null
          tags: string[] | null
          category: string | null
          status: 'pending' | 'changes_requested' | 'approved' | 'published' | 'rejected'
          ai_model: string | null
          topic_reasoning: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          meta_description: string | null
          focus_keyword: string | null
          secondary_keywords: string[] | null
          keyword_density: number | null
          readability_score: number | null
          internal_links: string[] | null
          external_links: string[] | null
          schema_markup: Record<string, unknown> | null
          og_title: string | null
          og_description: string | null
          seo_score: number | null
          email_sent_at: string | null
          approved_at: string | null
          published_at: string | null
          requested_changes: string | null
          revision_count: number
          reading_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'blog' | 'how-to'
          title: string
          slug?: string | null
          excerpt?: string | null
          content?: string | null
          cover_image_url?: string | null
          tags?: string[] | null
          category?: string | null
          status?: 'pending' | 'changes_requested' | 'approved' | 'published' | 'rejected'
          ai_model?: string | null
          topic_reasoning?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          secondary_keywords?: string[] | null
          keyword_density?: number | null
          readability_score?: number | null
          internal_links?: string[] | null
          external_links?: string[] | null
          schema_markup?: Record<string, unknown> | null
          og_title?: string | null
          og_description?: string | null
          seo_score?: number | null
          email_sent_at?: string | null
          approved_at?: string | null
          published_at?: string | null
          requested_changes?: string | null
          revision_count?: number
          reading_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'blog' | 'how-to'
          title?: string
          slug?: string | null
          excerpt?: string | null
          content?: string | null
          cover_image_url?: string | null
          tags?: string[] | null
          category?: string | null
          status?: 'pending' | 'changes_requested' | 'approved' | 'published' | 'rejected'
          ai_model?: string | null
          topic_reasoning?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          secondary_keywords?: string[] | null
          keyword_density?: number | null
          readability_score?: number | null
          internal_links?: string[] | null
          external_links?: string[] | null
          schema_markup?: Record<string, unknown> | null
          og_title?: string | null
          og_description?: string | null
          seo_score?: number | null
          email_sent_at?: string | null
          approved_at?: string | null
          published_at?: string | null
          requested_changes?: string | null
          revision_count?: number
          reading_time?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      content_performance: {
        Row: {
          id: string
          post_id: string | null
          post_type: 'blog' | 'how-to'
          views: number
          avg_time_on_page: number
          bounce_rate: number
          social_shares: number
          recorded_at: string
        }
        Insert: {
          id?: string
          post_id?: string | null
          post_type: 'blog' | 'how-to'
          views?: number
          avg_time_on_page?: number
          bounce_rate?: number
          social_shares?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          post_id?: string | null
          post_type?: 'blog' | 'how-to'
          views?: number
          avg_time_on_page?: number
          bounce_rate?: number
          social_shares?: number
          recorded_at?: string
        }
      }
      content_settings: {
        Row: {
          id: string
          daily_schedule_time: string
          auto_publish_after_approval: boolean
          target_keywords: string[]
          excluded_topics: string[]
          site_niche_context: string
          updated_at: string
        }
        Insert: {
          id?: string
          daily_schedule_time?: string
          auto_publish_after_approval?: boolean
          target_keywords?: string[]
          excluded_topics?: string[]
          site_niche_context?: string
          updated_at?: string
        }
        Update: {
          id?: string
          daily_schedule_time?: string
          auto_publish_after_approval?: boolean
          target_keywords?: string[]
          excluded_topics?: string[]
          site_niche_context?: string
          updated_at?: string
        }
      }
      seo_audit_log: {
        Row: {
          id: string
          page_url: string
          status_code: number | null
          indexed: boolean | null
          canonical_url: string | null
          meta_title: string | null
          meta_description: string | null
          issues: string[] | null
          ai_suggestions: Json | null
          last_checked_at: string
        }
        Insert: {
          id?: string
          page_url: string
          status_code?: number | null
          indexed?: boolean | null
          canonical_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          issues?: string[] | null
          ai_suggestions?: Json | null
          last_checked_at?: string
        }
        Update: {
          id?: string
          page_url?: string
          status_code?: number | null
          indexed?: boolean | null
          canonical_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          issues?: string[] | null
          ai_suggestions?: Json | null
          last_checked_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never
