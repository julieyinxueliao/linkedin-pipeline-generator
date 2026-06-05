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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_slots: {
        Row: {
          archetype: string
          asset_needed: string | null
          calendar_id: string
          created_at: string
          cta_type: string
          day_of_week: number
          draft_id: string | null
          funnel_stage: string
          id: string
          pillar: string
          scheduled_for: string | null
          status: string
          updated_at: string
          user_id: string
          week: number
          working_angle: string
        }
        Insert: {
          archetype: string
          asset_needed?: string | null
          calendar_id: string
          created_at?: string
          cta_type: string
          day_of_week: number
          draft_id?: string | null
          funnel_stage: string
          id?: string
          pillar: string
          scheduled_for?: string | null
          status?: string
          updated_at?: string
          user_id: string
          week: number
          working_angle: string
        }
        Update: {
          archetype?: string
          asset_needed?: string | null
          calendar_id?: string
          created_at?: string
          cta_type?: string
          day_of_week?: number
          draft_id?: string | null
          funnel_stage?: string
          id?: string
          pillar?: string
          scheduled_for?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          week?: number
          working_angle?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_slots_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      calendars: {
        Row: {
          approved_at: string | null
          cadence_per_week: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          weeks: number
        }
        Insert: {
          approved_at?: string | null
          cadence_per_week?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          weeks?: number
        }
        Update: {
          approved_at?: string | null
          cadence_per_week?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          weeks?: number
        }
        Relationships: []
      }
      connected_sources: {
        Row: {
          connected_at: string
          document_count: number
          icon: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          document_count?: number
          icon: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          connected_at?: string
          document_count?: number
          icon?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      content_suggestions: {
        Row: {
          created_at: string
          excerpt: string
          id: string
          source: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          excerpt: string
          id?: string
          source: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          excerpt?: string
          id?: string
          source?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
      drafts: {
        Row: {
          archetype: string | null
          calendar_slot_id: string | null
          content: string
          created_at: string
          id: string
          schedule_slot_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype?: string | null
          calendar_slot_id?: string | null
          content: string
          created_at?: string
          id?: string
          schedule_slot_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string | null
          calendar_slot_id?: string | null
          content?: string
          created_at?: string
          id?: string
          schedule_slot_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drafts_calendar_slot_id_fkey"
            columns: ["calendar_slot_id"]
            isOneToOne: false
            referencedRelation: "calendar_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drafts_schedule_slot_id_fkey"
            columns: ["schedule_slot_id"]
            isOneToOne: false
            referencedRelation: "schedule_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          goal: string
          goal_custom: string | null
          id: string
          industry: string
          name: string
          onboarding_complete: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal?: string
          goal_custom?: string | null
          id?: string
          industry?: string
          name?: string
          onboarding_complete?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal?: string
          goal_custom?: string | null
          id?: string
          industry?: string
          name?: string
          onboarding_complete?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_slots: {
        Row: {
          content: string | null
          created_at: string
          date: string
          format: string
          id: string
          status: string
          theme: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          date: string
          format: string
          id?: string
          status?: string
          theme: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          date?: string
          format?: string
          id?: string
          status?: string
          theme?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_briefs: {
        Row: {
          approved: boolean
          asset_inventory: Json
          category_pov: string | null
          company: Json
          created_at: string
          icp: Json
          id: string
          pillars: Json
          positioning: string | null
          pov_bank: Json
          preset: string
          proof_points: Json
          sample_posts: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          asset_inventory?: Json
          category_pov?: string | null
          company?: Json
          created_at?: string
          icp?: Json
          id?: string
          pillars?: Json
          positioning?: string | null
          pov_bank?: Json
          preset?: string
          proof_points?: Json
          sample_posts?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          asset_inventory?: Json
          category_pov?: string | null
          company?: Json
          created_at?: string
          icp?: Json
          id?: string
          pillars?: Json
          positioning?: string | null
          pov_bank?: Json
          preset?: string
          proof_points?: Json
          sample_posts?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_profiles: {
        Row: {
          created_at: string
          id: string
          sample_posts: string[]
          traits: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sample_posts?: string[]
          traits?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sample_posts?: string[]
          traits?: string[]
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
