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
      ai_responses: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          response_type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          response_type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          response_type?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_collaborations: {
        Row: {
          brand_description: string | null
          brand_name: string
          collaboration_type: string | null
          compensation: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          requirements: string | null
        }
        Insert: {
          brand_description?: string | null
          brand_name: string
          collaboration_type?: string | null
          compensation?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string | null
        }
        Update: {
          brand_description?: string | null
          brand_name?: string
          collaboration_type?: string | null
          compensation?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          requirements?: string | null
        }
        Relationships: []
      }
      collaboration_applications: {
        Row: {
          collaboration_id: string
          created_at: string | null
          id: string
          message: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          collaboration_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          collaboration_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_applications_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "brand_collaborations"
            referencedColumns: ["id"]
          },
        ]
      }
      hashtags: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          trend_score: number | null
          trending: boolean | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          trend_score?: number | null
          trending?: boolean | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          trend_score?: number | null
          trending?: boolean | null
        }
        Relationships: []
      }
      monetization_insights: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_value: number | null
          id: string
          insight_type: string
          is_implemented: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          insight_type: string
          is_implemented?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_value?: number | null
          id?: string
          insight_type?: string
          is_implemented?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      post_automations: {
        Row: {
          content: string | null
          content_type: string | null
          created_at: string
          id: string
          is_active: boolean | null
          media_urls: string[] | null
          platform: string
          schedule: Json | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          media_urls?: string[] | null
          platform: string
          schedule?: Json | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          media_urls?: string[] | null
          platform?: string
          schedule?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_automations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          platform: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          platform: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          platform?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      voice_settings: {
        Row: {
          created_at: string
          id: string
          pitch: number | null
          sample_url: string | null
          speed: number | null
          updated_at: string
          user_id: string
          voice_id: string | null
          voice_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          pitch?: number | null
          sample_url?: string | null
          speed?: number | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          pitch?: number | null
          sample_url?: string | null
          speed?: number | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
