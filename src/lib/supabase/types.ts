/**
 * Database type definitions for the D2C skincare platform.
 *
 * This file was authored by hand from TDD.md §3 and matches the migrations in
 * supabase/migrations/.
 *
 * Once local Supabase is running, regenerate with:
 *   pnpm db:types
 *   (runs: supabase gen types typescript --local > src/lib/supabase/types.ts)
 *
 * NOTE: Each table requires a `Relationships` field for @supabase/supabase-js v2
 * generic type inference to work correctly. Without it the client infers `never`
 * for Insert/Update operations.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category: 'serum' | 'moisturiser' | 'toner' | 'spf'
          skin_types: string[]
          concerns: string[]
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category: 'serum' | 'moisturiser' | 'toner' | 'spf'
          skin_types?: string[]
          concerns?: string[]
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: 'serum' | 'moisturiser' | 'toner' | 'spf'
          skin_types?: string[]
          concerns?: string[]
          image_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size_ml: number
          price: number
          sku: string
          stock: number
          is_active: boolean
        }
        Insert: {
          id?: string
          product_id: string
          size_ml: number
          price: number
          sku: string
          stock?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          product_id?: string
          size_ml?: number
          price?: number
          sku?: string
          stock?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      product_ingredients: {
        Row: {
          id: string
          product_id: string
          name: string
          concentration: number | null
          benefit: string | null
          science_note: string | null
          display_order: number
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          concentration?: number | null
          benefit?: string | null
          science_note?: string | null
          display_order?: number
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          concentration?: number | null
          benefit?: string | null
          science_note?: string | null
          display_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'product_ingredients_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          id: string
          email: string | null
          skin_type: 'dry' | 'oily' | 'combination' | 'sensitive' | null
          concerns: string[]
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          skin_type?: 'dry' | 'oily' | 'combination' | 'sensitive' | null
          concerns?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          skin_type?: 'dry' | 'oily' | 'combination' | 'sensitive' | null
          concerns?: string[]
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          guest_email: string | null
          status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_total: number
          total: number
          shipping_address: Json
          contact_email: string
          contact_phone: string | null
          tracking_id: string | null
          carrier: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          guest_email?: string | null
          status?: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_total?: number
          total: number
          shipping_address: Json
          contact_email: string
          contact_phone?: string | null
          tracking_id?: string | null
          carrier?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_email?: string | null
          status?: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          shipping_total?: number
          total?: number
          shipping_address?: Json
          contact_email?: string
          contact_phone?: string | null
          tracking_id?: string | null
          carrier?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string | null
          product_name: string
          variant_sku: string
          quantity: number
          unit_price: number
          line_total: number
        }
        Insert: {
          id?: string
          order_id: string
          variant_id?: string | null
          product_name: string
          variant_sku: string
          quantity: number
          unit_price: number
          line_total: number
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string | null
          product_name?: string
          variant_sku?: string
          quantity?: number
          unit_price?: number
          line_total?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey'
            columns: ['variant_id']
            isOneToOne: false
            referencedRelation: 'product_variants'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          body: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          body?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          body?: string | null
          is_approved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      support_tickets: {
        Row: {
          id: string
          order_id: string | null
          user_id: string | null
          guest_email: string | null
          subject: string
          body: string
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          user_id?: string | null
          guest_email?: string | null
          subject: string
          body: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          user_id?: string | null
          guest_email?: string | null
          subject?: string
          body?: string
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          assigned_to?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'support_tickets_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      create_order: {
        Args: {
          p_user_id:          string | null
          p_guest_email:      string | null
          p_contact_email:    string
          p_contact_phone:    string | null
          p_shipping_address: Json
          p_subtotal:         number
          p_shipping_total:   number
          p_total:            number
          p_items:            Json
        }
        Returns: Json
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
