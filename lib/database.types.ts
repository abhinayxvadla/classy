export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = Database["public"]["Enums"]["user_role"];
export type RosterStatus = Database["public"]["Enums"]["roster_status"];
export type ItemType = Database["public"]["Enums"]["item_type"];
export type ItemAccess = Database["public"]["Enums"]["item_access"];
export type ItemVisibility = Database["public"]["Enums"]["item_visibility"];
export type SubmissionStatus = Database["public"]["Enums"]["submission_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Batch = Database["public"]["Tables"]["batches"]["Row"];
export type Roster = Database["public"]["Tables"]["roster"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type SecurityAnswer = Database["public"]["Tables"]["security_answers"]["Row"];
export type McpToken = Database["public"]["Tables"]["mcp_tokens"]["Row"];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attempts: {
        Row: {
          answers: Json | null
          id: string
          item_id: string
          score: number | null
          student_id: string
          submitted_at: string
          total: number | null
        }
        Insert: {
          answers?: Json | null
          id?: string
          item_id: string
          score?: number | null
          student_id: string
          submitted_at?: string
          total?: number | null
        }
        Update: {
          answers?: Json | null
          id?: string
          item_id?: string
          score?: number | null
          student_id?: string
          submitted_at?: string
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          created_at: string
          description: string | null
          grade: string | null
          id: string
          join_code: string
          name: string
          premium_price_inr: number
          subject: string | null
          tutor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade?: string | null
          id?: string
          join_code?: string
          name: string
          premium_price_inr?: number
          subject?: string | null
          tutor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade?: string | null
          id?: string
          join_code?: string
          name?: string
          premium_price_inr?: number
          subject?: string | null
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          actor_id: string | null
          actor_role: Database["public"]["Enums"]["user_role"] | null
          batch_id: string | null
          client_name: string | null
          created_at: string
          duration_ms: number | null
          event: string
          id: number
          item_id: string | null
          meta: Json
          source: "mcp" | "app"
          success: boolean
          tool: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          batch_id?: string | null
          client_name?: string | null
          created_at?: string
          duration_ms?: number | null
          event: string
          id?: number
          item_id?: string | null
          meta?: Json
          source: "mcp" | "app"
          success?: boolean
          tool?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          batch_id?: string | null
          client_name?: string | null
          created_at?: string
          duration_ms?: number | null
          event?: string
          id?: number
          item_id?: string | null
          meta?: Json
          source?: "mcp" | "app"
          success?: boolean
          tool?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          access: Database["public"]["Enums"]["item_access"]
          batch_id: string | null
          body: Json
          created_at: string
          due_at: string | null
          grade: string | null
          id: string
          max_marks: number | null
          published: boolean
          source: "mcp" | "app"
          subject: string | null
          title: string
          tutor_id: string
          type: Database["public"]["Enums"]["item_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["item_visibility"]
        }
        Insert: {
          access?: Database["public"]["Enums"]["item_access"]
          batch_id?: string | null
          body?: Json
          created_at?: string
          due_at?: string | null
          grade?: string | null
          id?: string
          max_marks?: number | null
          published?: boolean
          source?: "mcp" | "app"
          subject?: string | null
          title: string
          tutor_id: string
          type: Database["public"]["Enums"]["item_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["item_visibility"]
        }
        Update: {
          access?: Database["public"]["Enums"]["item_access"]
          batch_id?: string | null
          body?: Json
          created_at?: string
          due_at?: string | null
          grade?: string | null
          id?: string
          max_marks?: number | null
          published?: boolean
          source?: "mcp" | "app"
          subject?: string | null
          title?: string
          tutor_id?: string
          type?: Database["public"]["Enums"]["item_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["item_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_tokens: {
        Row: {
          created_at: string
          id: string
          label: string
          last_used_at: string | null
          revoked_at: string | null
          token: string
          tutor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          token?: string
          tutor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          token?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mcp_tokens_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_inr: number
          batch_id: string
          commission_inr: number
          created_at: string
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
        }
        Insert: {
          amount_inr: number
          batch_id: string
          commission_inr: number
          created_at?: string
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
        }
        Update: {
          amount_inr?: number
          batch_id?: string
          commission_inr?: number
          created_at?: string
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          grade: string | null
          id: string
          institute: string | null
          last_seen_at: string | null
          must_change_password: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          subjects: string[] | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          grade?: string | null
          id: string
          institute?: string | null
          last_seen_at?: string | null
          must_change_password?: boolean | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          subjects?: string[] | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          grade?: string | null
          id?: string
          institute?: string | null
          last_seen_at?: string | null
          must_change_password?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subjects?: string[] | null
        }
        Relationships: []
      }
      quiz_keys: {
        Row: {
          answers: Json
          item_id: string
        }
        Insert: {
          answers: Json
          item_id: string
        }
        Update: {
          answers?: Json
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_keys_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      roster: {
        Row: {
          batch_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          joined_at: string | null
          phone: string | null
          premium_until: string | null
          status: Database["public"]["Enums"]["roster_status"]
          student_id: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          joined_at?: string | null
          phone?: string | null
          premium_until?: string | null
          status?: Database["public"]["Enums"]["roster_status"]
          student_id?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          joined_at?: string | null
          phone?: string | null
          premium_until?: string | null
          status?: Database["public"]["Enums"]["roster_status"]
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roster_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_answers: {
        Row: {
          answer_hash: string
          failed_attempts: number
          locked_until: string | null
          question: string
          user_id: string
        }
        Insert: {
          answer_hash: string
          failed_attempts?: number
          locked_until?: string | null
          question: string
          user_id: string
        }
        Update: {
          answer_hash?: string
          failed_attempts?: number
          locked_until?: string | null
          question?: string
          user_id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          feedback: string | null
          graded_at: string | null
          id: string
          item_id: string
          link_url: string | null
          marks: number | null
          released_at: string | null
          status: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at: string
          text_answer: string | null
        }
        Insert: {
          feedback?: string | null
          graded_at?: string | null
          id?: string
          item_id: string
          link_url?: string | null
          marks?: number | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id: string
          submitted_at?: string
          text_answer?: string | null
        }
        Update: {
          feedback?: string | null
          graded_at?: string | null
          id?: string
          item_id?: string
          link_url?: string | null
          marks?: number | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          student_id?: string
          submitted_at?: string
          text_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
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
      generate_join_code: { Args: never; Returns: string }
      generate_mcp_token: { Args: never; Returns: string }
      get_batch_public: { Args: { p_code: string }; Returns: Json }
      get_item_for_student: { Args: { p_item_id: string }; Returns: Json }
      get_my_batches: { Args: never; Returns: Json }
      get_public_library: { Args: never; Returns: Json }
      get_student_feed: { Args: { p_batch_id: string }; Returns: Json }
      has_batch_premium: { Args: { batch_id: string }; Returns: boolean }
      is_batch_member: { Args: { batch_id: string }; Returns: boolean }
      is_batch_tutor: { Args: { batch_id: string }; Returns: boolean }
      join_batch_by_code: { Args: { p_code: string }; Returns: Json }
      request_join: { Args: { p_batch_id: string }; Returns: Json }
      submit_assignment: {
        Args: { p_item_id: string; p_link: string; p_text: string }
        Returns: Json
      }
      submit_quiz: {
        Args: { p_answers: Json; p_item_id: string }
        Returns: Json
      }
    }
    Enums: {
      item_access: "free" | "premium"
      item_type: "quiz" | "notes" | "assignment" | "announcement"
      item_visibility: "batch" | "public"
      payment_status: "created" | "paid" | "failed"
      roster_status: "invited" | "joined" | "pending" | "rejected"
      submission_status: "submitted" | "graded" | "released"
      user_role: "tutor" | "student"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      item_access: ["free", "premium"],
      item_type: ["quiz", "notes", "assignment", "announcement"],
      item_visibility: ["batch", "public"],
      payment_status: ["created", "paid", "failed"],
      roster_status: ["invited", "joined", "pending", "rejected"],
      submission_status: ["submitted", "graded", "released"],
      user_role: ["tutor", "student"],
    },
  },
} as const
