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
