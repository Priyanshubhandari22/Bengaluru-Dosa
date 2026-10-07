export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      addons: {
        Row: {
          id: string;
          name: string;
          price: number;
          sort_order: number;
        };
        Insert: {
          id: string;
          name: string;
          price: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          city: string;
          created_at: string;
          id: string;
          label: string;
          line1: string;
          pincode: string;
          user_id: string;
        };
        Insert: {
          city: string;
          created_at?: string;
          id?: string;
          label?: string;
          line1: string;
          pincode: string;
          user_id: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          id?: string;
          label?: string;
          line1?: string;
          pincode?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          description: string | null;
          id: string;
          image_key: string | null;
          name: string;
          sort_order: number;
        };
        Insert: {
          description?: string | null;
          id: string;
          image_key?: string | null;
          name: string;
          sort_order?: number;
        };
        Update: {
          description?: string | null;
          id?: string;
          image_key?: string | null;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          active: boolean;
          code: string;
          description: string;
          first_order_only: boolean;
          kind: string;
          max_discount: number | null;
          min_subtotal: number;
          value: number;
        };
        Insert: {
          active?: boolean;
          code: string;
          description: string;
          first_order_only?: boolean;
          kind: string;
          max_discount?: number | null;
          min_subtotal?: number;
          value: number;
        };
        Update: {
          active?: boolean;
          code?: string;
          description?: string;
          first_order_only?: boolean;
          kind?: string;
          max_discount?: number | null;
          min_subtotal?: number;
          value?: number;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          category_id: string;
          created_at: string;
          customizable: boolean;
          description: string;
          id: string;
          image_key: string;
          ingredients: string[];
          is_available: boolean;
          is_bestseller: boolean;
          is_popular: boolean;
          is_veg: boolean;
          name: string;
          price: number;
          rating: number;
          spicy_level: number;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          customizable?: boolean;
          description?: string;
          id: string;
          image_key?: string;
          ingredients?: string[];
          is_available?: boolean;
          is_bestseller?: boolean;
          is_popular?: boolean;
          is_veg?: boolean;
          name: string;
          price: number;
          rating?: number;
          spicy_level?: number;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          customizable?: boolean;
          description?: string;
          id?: string;
          image_key?: string;
          ingredients?: string[];
          is_available?: boolean;
          is_bestseller?: boolean;
          is_popular?: boolean;
          is_veg?: boolean;
          name?: string;
          price?: number;
          rating?: number;
          spicy_level?: number;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          coupon_code: string | null;
          created_at: string;
          customer: Json;
          delivery_fee: number;
          discount: number;
          fulfilment: string;
          id: string;
          items: Json;
          order_number: string;
          payment_method: string;
          payment_status: string;
          status: string;
          subtotal: number;
          taxes: number;
          total: number;
          user_id: string;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string;
          customer: Json;
          delivery_fee?: number;
          discount?: number;
          fulfilment: string;
          id?: string;
          items: Json;
          order_number: string;
          payment_method: string;
          payment_status?: string;
          status?: string;
          subtotal: number;
          taxes?: number;
          total: number;
          user_id: string;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string;
          customer?: Json;
          delivery_fee?: number;
          discount?: number;
          fulfilment?: string;
          id?: string;
          items?: Json;
          order_number?: string;
          payment_method?: string;
          payment_status?: string;
          status?: string;
          subtotal?: number;
          taxes?: number;
          total?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          preferred_payment: string | null;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          preferred_payment?: string | null;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          preferred_payment?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
