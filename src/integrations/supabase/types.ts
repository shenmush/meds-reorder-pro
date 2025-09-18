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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      barman_orders: {
        Row: {
          bonus_percentage: number | null
          bonus_quantity: number | null
          company_name: string
          created_at: string
          created_by: string
          drug_id: string
          drug_name: string
          drug_type: string
          erx_code: string | null
          expiry_date: string | null
          gtin: string | null
          id: string
          irc: string | null
          notes: string | null
          order_date: string
          payment_method: string | null
          quantity_ordered: number
          total_received_quantity: number
          updated_at: string
        }
        Insert: {
          bonus_percentage?: number | null
          bonus_quantity?: number | null
          company_name: string
          created_at?: string
          created_by: string
          drug_id: string
          drug_name: string
          drug_type: string
          erx_code?: string | null
          expiry_date?: string | null
          gtin?: string | null
          id?: string
          irc?: string | null
          notes?: string | null
          order_date?: string
          payment_method?: string | null
          quantity_ordered: number
          total_received_quantity?: number
          updated_at?: string
        }
        Update: {
          bonus_percentage?: number | null
          bonus_quantity?: number | null
          company_name?: string
          created_at?: string
          created_by?: string
          drug_id?: string
          drug_name?: string
          drug_type?: string
          erx_code?: string | null
          expiry_date?: string | null
          gtin?: string | null
          id?: string
          irc?: string | null
          notes?: string | null
          order_date?: string
          payment_method?: string | null
          quantity_ordered?: number
          total_received_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      chemical_drugs: {
        Row: {
          action: string | null
          created_at: string
          erx_code: string | null
          full_brand_name: string
          generic_code: string | null
          gtin: string | null
          id: string
          irc: string
          is_active: boolean
          license_owner_company_name: string | null
          license_owner_company_national_id: string | null
          package_count: number | null
          updated_at: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          erx_code?: string | null
          full_brand_name: string
          generic_code?: string | null
          gtin?: string | null
          id?: string
          irc: string
          is_active?: boolean
          license_owner_company_name?: string | null
          license_owner_company_national_id?: string | null
          package_count?: number | null
          updated_at?: string
        }
        Update: {
          action?: string | null
          created_at?: string
          erx_code?: string | null
          full_brand_name?: string
          generic_code?: string | null
          gtin?: string | null
          id?: string
          irc?: string
          is_active?: boolean
          license_owner_company_name?: string | null
          license_owner_company_national_id?: string | null
          package_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      consolidated_drug_status: {
        Row: {
          created_at: string
          drug_id: string
          id: string
          order_item_ids: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          drug_id: string
          id?: string
          order_item_ids?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          drug_id?: string
          id?: string
          order_item_ids?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_supplies: {
        Row: {
          action: string | null
          created_at: string
          erx_code: string | null
          gtin: string | null
          id: string
          irc: string
          is_active: boolean
          license_owner_company_name: string | null
          license_owner_company_national_code: string | null
          package_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          action?: string | null
          created_at?: string
          erx_code?: string | null
          gtin?: string | null
          id?: string
          irc: string
          is_active?: boolean
          license_owner_company_name?: string | null
          license_owner_company_national_code?: string | null
          package_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          action?: string | null
          created_at?: string
          erx_code?: string | null
          gtin?: string | null
          id?: string
          irc?: string
          is_active?: boolean
          license_owner_company_name?: string | null
          license_owner_company_national_code?: string | null
          package_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      natural_products: {
        Row: {
          action: string | null
          atc_code: string | null
          created_at: string
          erx_code: string | null
          full_en_brand_name: string
          gtin: string | null
          id: string
          irc: string
          is_active: boolean
          license_owner_name: string | null
          license_owner_national_code: string | null
          package_count: number | null
          updated_at: string
        }
        Insert: {
          action?: string | null
          atc_code?: string | null
          created_at?: string
          erx_code?: string | null
          full_en_brand_name: string
          gtin?: string | null
          id?: string
          irc: string
          is_active?: boolean
          license_owner_name?: string | null
          license_owner_national_code?: string | null
          package_count?: number | null
          updated_at?: string
        }
        Update: {
          action?: string | null
          atc_code?: string | null
          created_at?: string
          erx_code?: string | null
          full_en_brand_name?: string
          gtin?: string | null
          id?: string
          irc?: string
          is_active?: boolean
          license_owner_name?: string | null
          license_owner_national_code?: string | null
          package_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_approvals: {
        Row: {
          created_at: string
          from_status: string
          id: string
          notes: string | null
          order_id: string
          to_status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_status: string
          id?: string
          notes?: string | null
          order_id: string
          to_status: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_status?: string
          id?: string
          notes?: string | null
          order_id?: string
          to_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_pricing: {
        Row: {
          created_at: string
          drug_id: string
          id: string
          notes: string | null
          order_id: string
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          drug_id: string
          id?: string
          notes?: string | null
          order_id: string
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          drug_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_pricing_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          drug_id: string
          id: string
          order_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          drug_id: string
          id?: string
          order_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          drug_id?: string
          id?: string
          order_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invoice_amount: number | null
          notes: string | null
          payment_date: string | null
          payment_proof_url: string | null
          payment_rejection_reason: string | null
          pharmacy_id: string
          pricing_notes: string | null
          status: string
          total_items: number
          updated_at: string
          workflow_status: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_amount?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_proof_url?: string | null
          payment_rejection_reason?: string | null
          pharmacy_id: string
          pricing_notes?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          workflow_status?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_amount?: number | null
          notes?: string | null
          payment_date?: string | null
          payment_proof_url?: string | null
          payment_rejection_reason?: string | null
          pharmacy_id?: string
          pricing_notes?: string | null
          status?: string
          total_items?: number
          updated_at?: string
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string | null
          created_at: string
          id: string
          license_number: string | null
          max_accountants: number | null
          max_staff: number | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          license_number?: string | null
          max_accountants?: number | null
          max_staff?: number | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          license_number?: string | null
          max_accountants?: number | null
          max_staff?: number | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          pharmacy_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pharmacy_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pharmacy_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_profiles"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_staff: {
        Args: { password_input: string; username_input: string }
        Returns: {
          pharmacy_id: string
          pharmacy_name: string
          role: Database["public"]["Enums"]["app_role"]
          staff_id: string
          staff_name: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager_of_pharmacy: {
        Args: { _pharmacy_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "pharmacy_staff"
        | "pharmacy_manager"
        | "barman_staff"
        | "barman_manager"
        | "pharmacy_accountant"
        | "barman_accountant"
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
      app_role: [
        "admin",
        "user",
        "pharmacy_staff",
        "pharmacy_manager",
        "barman_staff",
        "barman_manager",
        "pharmacy_accountant",
        "barman_accountant",
      ],
    },
  },
} as const
