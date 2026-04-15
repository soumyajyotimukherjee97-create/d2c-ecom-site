/**
 * Database type definitions for the D2C skincare platform.
 *
 * This file was authored by hand from TDD.md §3 and matches the migration in
 * supabase/migrations/001_initial_schema.sql.
 *
 * Once local Supabase is running, regenerate with:
 *   pnpm db:types
 *   (runs: supabase gen types typescript --local > src/lib/supabase/types.ts)
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
          is_active?: boolean
          updated_at?: string
        }
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
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
