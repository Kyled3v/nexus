// Supabase database type definitions
// These will be generated from the actual schema once migrations are applied.
// For now, manual types that match our domain model.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organisations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["organisations"]["Insert"]>;
      };
      branches: {
        Row: {
          id: string;
          organisation_id: string;
          name: string;
          code: string;
          is_head_office: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["branches"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["branches"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          organisation_id: string;
          sku: string;
          barcode: string | null;
          name: string;
          description: string | null;
          category_id: string | null;
          brand_id: string | null;
          unit: string;
          cost_price: number;
          selling_price: number;
          tax_rate: number;
          tax_inclusive: boolean;
          supplier_id: string | null;
          reorder_level: number;
          target_stock: number;
          min_stock: number;
          max_stock: number;
          status: string;
          attributes: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          organisation_id: string;
          branch_id: string;
          product_id: string;
          current_stock: number;
          reserved_stock: number;
          available_stock: number;
          last_movement_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      sales: {
        Row: {
          id: string;
          organisation_id: string;
          branch_id: string;
          till_id: string;
          session_id: string;
          sale_number: string;
          customer_id: string | null;
          cashier_id: string;
          status: string;
          subtotal: number;
          tax_amount: number;
          discount_amount: number;
          total: number;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sales"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sales"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          organisation_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          status: string;
          tags: string[];
          total_spend: number;
          transaction_count: number;
          last_purchase_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          organisation_id: string;
          branch_id: string | null;
          user_id: string;
          user_role: string;
          action: string;
          entity_type: string;
          entity_id: string;
          description: string;
          before: Json | null;
          after: Json | null;
          source: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
