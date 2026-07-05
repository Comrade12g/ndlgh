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
      agent_margin_ledger: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          entry_type: string
          id: string
          notes: string | null
          purchase_order_id: string | null
          transaction_id: string | null
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          entry_type: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          entry_type?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_margin_ledger_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_margin_ledger_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aml_po_fk"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aml_tx_fk"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          assigned_to: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["contact_status"]
          type: Database["public"]["Enums"]["contact_type"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          assigned_to?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          type?: Database["public"]["Enums"]["contact_type"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          assigned_to?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          type?: Database["public"]["Enums"]["contact_type"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          code: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivered_at: string | null
          driver_id: string | null
          fee_amount: number | null
          fee_currency: string | null
          id: string
          notes: string | null
          pod_photo_urls: string[]
          pod_signature_url: string | null
          pod_signed_by: string | null
          recipient_name: string
          recipient_phone: string
          region: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["delivery_status"]
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city?: string
          code?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          driver_id?: string | null
          fee_amount?: number | null
          fee_currency?: string | null
          id?: string
          notes?: string | null
          pod_photo_urls?: string[]
          pod_signature_url?: string | null
          pod_signed_by?: string | null
          recipient_name: string
          recipient_phone: string
          region?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          code?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          driver_id?: string | null
          fee_amount?: number | null
          fee_currency?: string | null
          id?: string
          notes?: string | null
          pod_photo_urls?: string[]
          pod_signature_url?: string | null
          pod_signed_by?: string | null
          recipient_name?: string
          recipient_phone?: string
          region?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_packages: {
        Row: {
          delivery_id: string
          package_id: string
        }
        Insert: {
          delivery_id: string
          package_id: string
        }
        Update: {
          delivery_id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_packages_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_delivery_fk"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_package_fk"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          effective_date: string
          id: string
          rate_to_ghs: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency: string
          effective_date?: string
          id?: string
          rate_to_ghs: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_date?: string
          id?: string
          rate_to_ghs?: number
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          package_id: string | null
          qty: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          package_id?: string | null
          qty?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          package_id?: string | null
          qty?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_invoice_fk"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_package_fk"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          delivery_id: string | null
          due_date: string | null
          id: string
          is_consolidated: boolean
          issue_date: string
          notes: string | null
          number: string
          shipment_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          delivery_id?: string | null
          due_date?: string | null
          id?: string
          is_consolidated?: boolean
          issue_date?: string
          notes?: string | null
          number?: string
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          delivery_id?: string | null
          due_date?: string | null
          id?: string
          is_consolidated?: boolean
          issue_date?: string
          notes?: string | null
          number?: string
          shipment_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_delivery_fk"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shipment_fk"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          cbm: number
          created_at: string
          customer_id: string | null
          declared_currency: string | null
          declared_value: number | null
          description: string | null
          external_tracking: string | null
          height_cm: number | null
          id: string
          length_cm: number | null
          notes: string | null
          photos_urls: string[]
          pieces: number
          purchase_order_id: string | null
          received_at: string | null
          received_by: string | null
          shipping_mark: string | null
          status: Database["public"]["Enums"]["package_status"]
          supplier_name: string | null
          tracking_code: string
          updated_at: string
          warehouse_code: string | null
          weight_kg: number
          width_cm: number | null
        }
        Insert: {
          cbm?: number
          created_at?: string
          customer_id?: string | null
          declared_currency?: string | null
          declared_value?: number | null
          description?: string | null
          external_tracking?: string | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          notes?: string | null
          photos_urls?: string[]
          pieces?: number
          purchase_order_id?: string | null
          received_at?: string | null
          received_by?: string | null
          shipping_mark?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          supplier_name?: string | null
          tracking_code?: string
          updated_at?: string
          warehouse_code?: string | null
          weight_kg?: number
          width_cm?: number | null
        }
        Update: {
          cbm?: number
          created_at?: string
          customer_id?: string | null
          declared_currency?: string | null
          declared_value?: number | null
          description?: string | null
          external_tracking?: string | null
          height_cm?: number | null
          id?: string
          length_cm?: number | null
          notes?: string | null
          photos_urls?: string[]
          pieces?: number
          purchase_order_id?: string | null
          received_at?: string | null
          received_by?: string | null
          shipping_mark?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          supplier_name?: string | null
          tracking_code?: string
          updated_at?: string
          warehouse_code?: string | null
          weight_kg?: number
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_po_fk"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_warehouse_code_fkey"
            columns: ["warehouse_code"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "packages_warehouse_fk"
            columns: ["warehouse_code"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string | null
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          received_at: string
          received_by: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          received_at?: string
          received_by?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          received_at?: string
          received_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_fk"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          default_origin: string | null
          full_name: string | null
          id: string
          phone: string | null
          shipping_mark: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_origin?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          shipping_mark?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_origin?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          shipping_mark?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          agent_id: string | null
          code: string
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          description: string | null
          id: string
          margin_amount: number
          ordered_at: string | null
          proof_url: string | null
          quantity: number | null
          received_at: string | null
          sell_price: number
          sourcing_request_id: string | null
          status: Database["public"]["Enums"]["po_status"]
          supplier_cost: number
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          margin_amount?: number
          ordered_at?: string | null
          proof_url?: string | null
          quantity?: number | null
          received_at?: string | null
          sell_price?: number
          sourcing_request_id?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_cost?: number
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          margin_amount?: number
          ordered_at?: string | null
          proof_url?: string | null
          quantity?: number | null
          received_at?: string | null
          sell_price?: number
          sourcing_request_id?: string | null
          status?: Database["public"]["Enums"]["po_status"]
          supplier_cost?: number
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_sr_fk"
            columns: ["sourcing_request_id"]
            isOneToOne: false
            referencedRelation: "sourcing_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_supplier_fk"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_sourcing_request_id_fkey"
            columns: ["sourcing_request_id"]
            isOneToOne: false
            referencedRelation: "sourcing_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rates: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          currency: string
          destination_code: string | null
          effective_from: string
          id: string
          mode: Database["public"]["Enums"]["shipment_mode"]
          notes: string | null
          origin_code: string | null
          price: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          destination_code?: string | null
          effective_from?: string
          id?: string
          mode: Database["public"]["Enums"]["shipment_mode"]
          notes?: string | null
          origin_code?: string | null
          price: number
          unit: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          currency?: string
          destination_code?: string | null
          effective_from?: string
          id?: string
          mode?: Database["public"]["Enums"]["shipment_mode"]
          notes?: string | null
          origin_code?: string | null
          price?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rates_dest_fk"
            columns: ["destination_code"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "rates_destination_code_fkey"
            columns: ["destination_code"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "rates_origin_code_fkey"
            columns: ["origin_code"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "rates_origin_fk"
            columns: ["origin_code"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
        ]
      }
      shipment_packages: {
        Row: {
          added_at: string
          package_id: string
          shipment_id: string
        }
        Insert: {
          added_at?: string
          package_id: string
          shipment_id: string
        }
        Update: {
          added_at?: string
          package_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_packages_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sp_package_fk"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sp_shipment_fk"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          bol_no: string | null
          code: string
          container_no: string | null
          created_at: string
          created_by: string | null
          destination_warehouse: string | null
          eta: string | null
          etd: string | null
          freight_cost: number | null
          freight_currency: string | null
          id: string
          mode: Database["public"]["Enums"]["shipment_mode"]
          notes: string | null
          origin_warehouse: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          total_cbm: number
          total_weight_kg: number
          updated_at: string
          vessel_or_flight: string | null
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          bol_no?: string | null
          code?: string
          container_no?: string | null
          created_at?: string
          created_by?: string | null
          destination_warehouse?: string | null
          eta?: string | null
          etd?: string | null
          freight_cost?: number | null
          freight_currency?: string | null
          id?: string
          mode: Database["public"]["Enums"]["shipment_mode"]
          notes?: string | null
          origin_warehouse?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          total_cbm?: number
          total_weight_kg?: number
          updated_at?: string
          vessel_or_flight?: string | null
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          bol_no?: string | null
          code?: string
          container_no?: string | null
          created_at?: string
          created_by?: string | null
          destination_warehouse?: string | null
          eta?: string | null
          etd?: string | null
          freight_cost?: number | null
          freight_currency?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["shipment_mode"]
          notes?: string | null
          origin_warehouse?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          total_cbm?: number
          total_weight_kg?: number
          updated_at?: string
          vessel_or_flight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_destination_warehouse_fkey"
            columns: ["destination_warehouse"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "shipments_origin_warehouse_fkey"
            columns: ["origin_warehouse"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["code"]
          },
        ]
      }
      sourcing_requests: {
        Row: {
          assigned_agent: string | null
          budget_amount: number | null
          budget_currency: string | null
          code: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["sourcing_status"]
          target_country: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          budget_amount?: number | null
          budget_currency?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["sourcing_status"]
          target_country?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          budget_amount?: number | null
          budget_currency?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["sourcing_status"]
          target_country?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sourcing_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sr_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          wechat: string | null
        }
        Insert: {
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          wechat?: string | null
        }
        Update: {
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          wechat?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          agent_id: string | null
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          direction: Database["public"]["Enums"]["txn_direction"]
          fx_rate_to_ghs: number | null
          id: string
          invoice_id: string | null
          notes: string | null
          occurred_at: string
          payment_id: string | null
          proof_url: string | null
          purchase_order_id: string | null
          reference: string | null
          supplier_id: string | null
          txn_type: Database["public"]["Enums"]["txn_type"]
        }
        Insert: {
          agent_id?: string | null
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          direction: Database["public"]["Enums"]["txn_direction"]
          fx_rate_to_ghs?: number | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          occurred_at?: string
          payment_id?: string | null
          proof_url?: string | null
          purchase_order_id?: string | null
          reference?: string | null
          supplier_id?: string | null
          txn_type: Database["public"]["Enums"]["txn_type"]
        }
        Update: {
          agent_id?: string | null
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          direction?: Database["public"]["Enums"]["txn_direction"]
          fx_rate_to_ghs?: number | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          occurred_at?: string
          payment_id?: string | null
          proof_url?: string | null
          purchase_order_id?: string | null
          reference?: string | null
          supplier_id?: string | null
          txn_type?: Database["public"]["Enums"]["txn_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tx_customer_fk"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tx_invoice_fk"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tx_payment_fk"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tx_po_fk"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tx_supplier_fk"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          code: string
          country: string
          created_at: string
          name: string
        }
        Insert: {
          address?: string | null
          code: string
          country: string
          created_at?: string
          name: string
        }
        Update: {
          address?: string | null
          code?: string
          country?: string
          created_at?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_autoinvoice_package_manual: {
        Args: { _package_id: string }
        Returns: undefined
      }
      fn_generate_consolidated_invoice: {
        Args: { _shipment_id: string }
        Returns: string
      }
      generate_shipping_mark: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      price_package_line: {
        Args: { _pkg: Database["public"]["Tables"]["packages"]["Row"] }
        Returns: {
          amount: number
          qty: number
          unit: string
          unit_price: number
        }[]
      }
      recompute_invoice_totals: {
        Args: { _invoice_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "ops_warehouse"
        | "sales_accountant"
        | "sourcing_agent"
        | "driver"
        | "customer"
        | "sales"
        | "accountant"
        | "customer_service"
      contact_status: "new" | "active" | "vip" | "dormant" | "blocked"
      contact_type: "lead" | "customer" | "supplier_contact"
      delivery_status:
        | "scheduled"
        | "out_for_delivery"
        | "delivered"
        | "failed"
        | "cancelled"
      invoice_status: "draft" | "sent" | "partial" | "paid" | "void" | "overdue"
      package_status:
        | "expected"
        | "received"
        | "weighed"
        | "loaded"
        | "in_transit"
        | "arrived_gh"
        | "ready_delivery"
        | "delivered"
        | "returned"
        | "lost"
      payment_method:
        | "cash"
        | "bank"
        | "mobile_money"
        | "card"
        | "paystack"
        | "other"
      po_status:
        | "draft"
        | "ordered"
        | "paid"
        | "shipped"
        | "received"
        | "cancelled"
      shipment_mode: "sea_lcl" | "sea_fcl" | "air" | "intercity"
      shipment_status:
        | "planning"
        | "loading"
        | "departed"
        | "in_transit"
        | "arrived"
        | "clearing"
        | "cleared"
        | "closed"
        | "cancelled"
      sourcing_status:
        | "requested"
        | "quoted"
        | "approved"
        | "purchased"
        | "shipped"
        | "received"
        | "cancelled"
      txn_direction: "debit" | "credit"
      txn_type:
        | "supplier_payment"
        | "agent_float"
        | "agent_settlement"
        | "margin_receipt"
        | "customer_receipt"
        | "refund"
        | "expense"
        | "transfer"
        | "adjustment"
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
        "ops_warehouse",
        "sales_accountant",
        "sourcing_agent",
        "driver",
        "customer",
        "sales",
        "accountant",
        "customer_service",
      ],
      contact_status: ["new", "active", "vip", "dormant", "blocked"],
      contact_type: ["lead", "customer", "supplier_contact"],
      delivery_status: [
        "scheduled",
        "out_for_delivery",
        "delivered",
        "failed",
        "cancelled",
      ],
      invoice_status: ["draft", "sent", "partial", "paid", "void", "overdue"],
      package_status: [
        "expected",
        "received",
        "weighed",
        "loaded",
        "in_transit",
        "arrived_gh",
        "ready_delivery",
        "delivered",
        "returned",
        "lost",
      ],
      payment_method: [
        "cash",
        "bank",
        "mobile_money",
        "card",
        "paystack",
        "other",
      ],
      po_status: [
        "draft",
        "ordered",
        "paid",
        "shipped",
        "received",
        "cancelled",
      ],
      shipment_mode: ["sea_lcl", "sea_fcl", "air", "intercity"],
      shipment_status: [
        "planning",
        "loading",
        "departed",
        "in_transit",
        "arrived",
        "clearing",
        "cleared",
        "closed",
        "cancelled",
      ],
      sourcing_status: [
        "requested",
        "quoted",
        "approved",
        "purchased",
        "shipped",
        "received",
        "cancelled",
      ],
      txn_direction: ["debit", "credit"],
      txn_type: [
        "supplier_payment",
        "agent_float",
        "agent_settlement",
        "margin_receipt",
        "customer_receipt",
        "refund",
        "expense",
        "transfer",
        "adjustment",
      ],
    },
  },
} as const
