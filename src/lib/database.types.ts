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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          organization_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          organization_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      break_entries: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          paid: boolean
          started_at: string
          time_entry_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          paid?: boolean
          started_at?: string
          time_entry_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          paid?: boolean
          started_at?: string
          time_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "break_entries_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          availability: Json
          created_at: string
          email: string | null
          employment_status: string
          full_name: string
          hourly_rate_cents: number | null
          id: string
          job_title: string
          organization_id: string
          phone: string | null
          primary_location_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          availability?: Json
          created_at?: string
          email?: string | null
          employment_status?: string
          full_name: string
          hourly_rate_cents?: number | null
          id?: string
          job_title: string
          organization_id: string
          phone?: string | null
          primary_location_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          availability?: Json
          created_at?: string
          email?: string | null
          employment_status?: string
          full_name?: string
          hourly_rate_cents?: number | null
          id?: string
          job_title?: string
          organization_id?: string
          phone?: string | null
          primary_location_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_primary_location_id_organization_id_fkey"
            columns: ["primary_location_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          geofence_radius_meters: number
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          organization_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          geofence_radius_meters?: number
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          organization_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          geofence_radius_meters?: number
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          organization_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string
          created_by: string
          employee_id: string
          ends_at: string
          id: string
          location_id: string
          notes: string | null
          organization_id: string
          position: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          employee_id: string
          ends_at: string
          id?: string
          location_id: string
          notes?: string | null
          organization_id: string
          position: string
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          employee_id?: string
          ends_at?: string
          id?: string
          location_id?: string
          notes?: string | null
          organization_id?: string
          position?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_organization_id_fkey"
            columns: ["employee_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "shifts_location_id_organization_id_fkey"
            columns: ["location_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_requests: {
        Row: {
          created_at: string
          details: string | null
          employee_id: string
          ends_on: string | null
          id: string
          organization_id: string
          request_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          starts_on: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          employee_id: string
          ends_on?: string | null
          id?: string
          organization_id: string
          request_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          starts_on?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          employee_id?: string
          ends_on?: string | null
          id?: string
          organization_id?: string
          request_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          starts_on?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_requests_employee_id_organization_id_fkey"
            columns: ["employee_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "staff_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          clocked_in_at: string
          clocked_out_at: string | null
          corrected_by: string | null
          created_at: string
          employee_id: string
          id: string
          latitude: number | null
          location_id: string
          longitude: number | null
          notes: string | null
          organization_id: string
          source: string
          updated_at: string
        }
        Insert: {
          clocked_in_at?: string
          clocked_out_at?: string | null
          corrected_by?: string | null
          created_at?: string
          employee_id: string
          id?: string
          latitude?: number | null
          location_id: string
          longitude?: number | null
          notes?: string | null
          organization_id: string
          source?: string
          updated_at?: string
        }
        Update: {
          clocked_in_at?: string
          clocked_out_at?: string | null
          corrected_by?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          latitude?: number | null
          location_id?: string
          longitude?: number | null
          notes?: string | null
          organization_id?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_organization_id_fkey"
            columns: ["employee_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "time_entries_location_id_organization_id_fkey"
            columns: ["location_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_owner: {
        Args: {
          location_address?: string
          location_name: string
          owner_full_name: string
          owner_job_title?: string
          restaurant_name: string
          restaurant_timezone?: string
        }
        Returns: {
          employee_id: string
          location_id: string
          organization_id: string
        }[]
      }
      clock_in: {
        Args: {
          punch_latitude?: number
          punch_longitude?: number
          target_location_id: string
        }
        Returns: string
      }
      clock_out: { Args: never; Returns: string }
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

