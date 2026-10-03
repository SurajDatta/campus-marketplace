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
      alerts: {
        Row: {
          created_at: string
          deleted: boolean
          email_sent_at: string | null
          id: string
          image_url: string
          link: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean
          email_sent_at?: string | null
          id?: string
          image_url?: string
          link?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Update: {
          created_at?: string
          deleted?: boolean
          email_sent_at?: string | null
          id?: string
          image_url?: string
          link?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Relationships: []
      }
      biometric: {
        Row: {
          created_at: string
          credentials: string[]
          master_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credentials?: string[]
          master_key?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          credentials?: string[]
          master_key?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string
          id: string
          provider_token: string
          refresh_token: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          provider_token?: string
          refresh_token?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          provider_token?: string
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          short: string
        }
        Insert: {
          id?: number
          name: string
          short?: string
        }
        Update: {
          id?: number
          name?: string
          short?: string
        }
        Relationships: []
      }
      clicks: {
        Row: {
          created_at: string
          id: number
          item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          item_id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          item_id?: string
          user_id?: string
        }
        Relationships: []
      }
      contact: {
        Row: {
          created_at: string
          id: number
          message: string
          name: string
          subject: Database["public"]["Enums"]["subject"]
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string
          name?: string
          subject?: Database["public"]["Enums"]["subject"]
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          name?: string
          subject?: Database["public"]["Enums"]["subject"]
        }
        Relationships: []
      }
      credentials: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          device_info: string
          device_type: string
          id: string
          public_key: string
          transports: string[] | null
        }
        Insert: {
          counter: number
          created_at?: string
          credential_id: string
          device_info?: string
          device_type?: string
          id?: string
          public_key?: string
          transports?: string[] | null
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          device_info?: string
          device_type?: string
          id?: string
          public_key?: string
          transports?: string[] | null
        }
        Relationships: []
      }
      items: {
        Row: {
          active: boolean
          categories: number[]
          condition: Database["public"]["Enums"]["condition"]
          contact_preferences: string[]
          created_at: string
          deleted: boolean
          description: string
          id: string
          last_edited: string
          listing_price: number
          live: boolean
          location_preferences: number[]
          meetup_preferences: Json
          negotiable: boolean
          photo_sizes: Json[]
          photo_urls: string[]
          price: number
          quantity: number
          return_after_cancellation: boolean
          safe_meetup: boolean
          schedule_preferences: string[]
          seller_id: string
          test_verified: boolean
          title: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          categories?: number[]
          condition?: Database["public"]["Enums"]["condition"]
          contact_preferences?: string[]
          created_at?: string
          deleted?: boolean
          description?: string
          id?: string
          last_edited?: string
          listing_price?: number
          live?: boolean
          location_preferences?: number[]
          meetup_preferences?: Json
          negotiable?: boolean
          photo_sizes?: Json[]
          photo_urls: string[]
          price: number
          quantity?: number
          return_after_cancellation?: boolean
          safe_meetup?: boolean
          schedule_preferences?: string[]
          seller_id: string
          test_verified?: boolean
          title?: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          categories?: number[]
          condition?: Database["public"]["Enums"]["condition"]
          contact_preferences?: string[]
          created_at?: string
          deleted?: boolean
          description?: string
          id?: string
          last_edited?: string
          listing_price?: number
          live?: boolean
          location_preferences?: number[]
          meetup_preferences?: Json
          negotiable?: boolean
          photo_sizes?: Json[]
          photo_urls?: string[]
          price?: number
          quantity?: number
          return_after_cancellation?: boolean
          safe_meetup?: boolean
          schedule_preferences?: string[]
          seller_id?: string
          test_verified?: boolean
          title?: string
          verified?: boolean
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          blue_light: boolean
          created_by: string | null
          deleted: boolean
          id: number
          img_url: string
          latitude: number
          longitude: number
          name: string
          notes: string
          place_id: string | null
        }
        Insert: {
          address?: string | null
          blue_light?: boolean
          created_by?: string | null
          deleted?: boolean
          id?: number
          img_url?: string
          latitude?: number
          longitude?: number
          name?: string
          notes?: string
          place_id?: string | null
        }
        Update: {
          address?: string | null
          blue_light?: boolean
          created_by?: string | null
          deleted?: boolean
          id?: number
          img_url?: string
          latitude?: number
          longitude?: number
          name?: string
          notes?: string
          place_id?: string | null
        }
        Relationships: []
      }
      meetup: {
        Row: {
          buyer_chats: Json[]
          buyer_confirmed: boolean
          buyer_confirmed_at: string | null
          buyer_id: string
          buyer_location: Json | null
          buyer_met: boolean
          buyer_met_at: string | null
          buyer_notes: string | null
          cancel_fee: number | null
          cancel_reason: string | null
          confirm_payment_intent_id: string | null
          contact: string[] | null
          contact_enabled: boolean
          created_at: string
          expires_at: string | null
          id: string
          item_condition: Database["public"]["Enums"]["condition"]
          item_description: string
          item_id: string
          item_negotiable: boolean
          item_photo_sizes: Json[]
          item_photo_urls: string[]
          item_price: number
          item_title: string
          listed_at: string
          live: boolean
          location: number | null
          meetup_confirmed_at: string | null
          meetup_price: number
          payment_completed_at: string | null
          payment_intent_id: string | null
          potential_meetups: Json[]
          rescheduled: boolean
          rescheduled_at: string | null
          safe_meetup_enabled: boolean
          schedule_enabled: boolean
          seller_chats: Json[]
          seller_confirmed: boolean
          seller_confirmed_at: string | null
          seller_id: string
          seller_location: Json | null
          seller_met: boolean
          seller_met_at: string | null
          seller_notes: string | null
          status: Database["public"]["Enums"]["meetup_status"]
          time: string | null
          time_completed: string | null
        }
        Insert: {
          buyer_chats?: Json[]
          buyer_confirmed?: boolean
          buyer_confirmed_at?: string | null
          buyer_id?: string
          buyer_location?: Json | null
          buyer_met?: boolean
          buyer_met_at?: string | null
          buyer_notes?: string | null
          cancel_fee?: number | null
          cancel_reason?: string | null
          confirm_payment_intent_id?: string | null
          contact?: string[] | null
          contact_enabled?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          item_condition?: Database["public"]["Enums"]["condition"]
          item_description?: string
          item_id?: string
          item_negotiable?: boolean
          item_photo_sizes?: Json[]
          item_photo_urls?: string[]
          item_price?: number
          item_title?: string
          listed_at?: string
          live?: boolean
          location?: number | null
          meetup_confirmed_at?: string | null
          meetup_price?: number
          payment_completed_at?: string | null
          payment_intent_id?: string | null
          potential_meetups?: Json[]
          rescheduled?: boolean
          rescheduled_at?: string | null
          safe_meetup_enabled?: boolean
          schedule_enabled?: boolean
          seller_chats?: Json[]
          seller_confirmed?: boolean
          seller_confirmed_at?: string | null
          seller_id?: string
          seller_location?: Json | null
          seller_met?: boolean
          seller_met_at?: string | null
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["meetup_status"]
          time?: string | null
          time_completed?: string | null
        }
        Update: {
          buyer_chats?: Json[]
          buyer_confirmed?: boolean
          buyer_confirmed_at?: string | null
          buyer_id?: string
          buyer_location?: Json | null
          buyer_met?: boolean
          buyer_met_at?: string | null
          buyer_notes?: string | null
          cancel_fee?: number | null
          cancel_reason?: string | null
          confirm_payment_intent_id?: string | null
          contact?: string[] | null
          contact_enabled?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          item_condition?: Database["public"]["Enums"]["condition"]
          item_description?: string
          item_id?: string
          item_negotiable?: boolean
          item_photo_sizes?: Json[]
          item_photo_urls?: string[]
          item_price?: number
          item_title?: string
          listed_at?: string
          live?: boolean
          location?: number | null
          meetup_confirmed_at?: string | null
          meetup_price?: number
          payment_completed_at?: string | null
          payment_intent_id?: string | null
          potential_meetups?: Json[]
          rescheduled?: boolean
          rescheduled_at?: string | null
          safe_meetup_enabled?: boolean
          schedule_enabled?: boolean
          seller_chats?: Json[]
          seller_confirmed?: boolean
          seller_confirmed_at?: string | null
          seller_id?: string
          seller_location?: Json | null
          seller_met?: boolean
          seller_met_at?: string | null
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["meetup_status"]
          time?: string | null
          time_completed?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          location: Json | null
          meetup_id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: Json | null
          meetup_id: string
          message?: string
          sender_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: Json | null
          meetup_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_meetup_id_fkey"
            columns: ["meetup_id"]
            isOneToOne: false
            referencedRelation: "meetup"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_created_at: string | null
          account_id: string | null
          account_requirements: string[]
          alerts: string[]
          completed_journey: boolean
          contact_details: Json
          customer_id: string | null
          devices: string[]
          email_notifications: boolean
          favorites: string[]
          first_name: string | null
          google_calendar_id: string | null
          id: string
          items_sold: number
          last_name: string | null
          last_updated_preferences: string | null
          last_verified: string | null
          listings_created: number
          mfa_enabled: boolean
          personal_email: string | null
          campus_email: string
          seller_contact: string[]
          seller_locations: number[]
          seller_meetup: Json
          seller_schedule: Json
          seller_schedules: Json | null
          seller_schedules_new: string[]
          signed_up_at: string | null
          sms_notifications: boolean
          subscribed: boolean
          test_account_created_at: string | null
          test_account_id: string | null
          test_account_requirements: string[]
          test_completed_journey: boolean
          test_customer_id: string | null
          test_listings_created: number
          viewed_banner: boolean
          viewed_initial: boolean
        }
        Insert: {
          account_created_at?: string | null
          account_id?: string | null
          account_requirements?: string[]
          alerts?: string[]
          completed_journey?: boolean
          contact_details?: Json
          customer_id?: string | null
          devices?: string[]
          email_notifications?: boolean
          favorites?: string[]
          first_name?: string | null
          google_calendar_id?: string | null
          id: string
          items_sold?: number
          last_name?: string | null
          last_updated_preferences?: string | null
          last_verified?: string | null
          listings_created?: number
          mfa_enabled?: boolean
          personal_email?: string | null
          campus_email?: string
          seller_contact?: string[]
          seller_locations?: number[]
          seller_meetup?: Json
          seller_schedule?: Json
          seller_schedules?: Json | null
          seller_schedules_new?: string[]
          signed_up_at?: string | null
          sms_notifications?: boolean
          subscribed?: boolean
          test_account_created_at?: string | null
          test_account_id?: string | null
          test_account_requirements?: string[]
          test_completed_journey?: boolean
          test_customer_id?: string | null
          test_listings_created?: number
          viewed_banner?: boolean
          viewed_initial?: boolean
        }
        Update: {
          account_created_at?: string | null
          account_id?: string | null
          account_requirements?: string[]
          alerts?: string[]
          completed_journey?: boolean
          contact_details?: Json
          customer_id?: string | null
          devices?: string[]
          email_notifications?: boolean
          favorites?: string[]
          first_name?: string | null
          google_calendar_id?: string | null
          id?: string
          items_sold?: number
          last_name?: string | null
          last_updated_preferences?: string | null
          last_verified?: string | null
          listings_created?: number
          mfa_enabled?: boolean
          personal_email?: string | null
          campus_email?: string
          seller_contact?: string[]
          seller_locations?: number[]
          seller_meetup?: Json
          seller_schedule?: Json
          seller_schedules?: Json | null
          seller_schedules_new?: string[]
          signed_up_at?: string | null
          sms_notifications?: boolean
          subscribed?: boolean
          test_account_created_at?: string | null
          test_account_id?: string | null
          test_account_requirements?: string[]
          test_completed_journey?: boolean
          test_customer_id?: string | null
          test_listings_created?: number
          viewed_banner?: boolean
          viewed_initial?: boolean
        }
        Relationships: []
      }
      schedules: {
        Row: {
          active: boolean
          created_at: string
          days: Json
          friday: number[]
          id: string
          location: number
          monday: number[]
          saturday: number[]
          sunday: number[]
          thursday: number[]
          tuesday: number[]
          user_id: string
          wednesday: number[]
        }
        Insert: {
          active?: boolean
          created_at?: string
          days?: Json
          friday?: number[]
          id?: string
          location?: number
          monday?: number[]
          saturday?: number[]
          sunday?: number[]
          thursday?: number[]
          tuesday?: number[]
          user_id?: string
          wednesday?: number[]
        }
        Update: {
          active?: boolean
          created_at?: string
          days?: Json
          friday?: number[]
          id?: string
          location?: number
          monday?: number[]
          saturday?: number[]
          sunday?: number[]
          thursday?: number[]
          tuesday?: number[]
          user_id?: string
          wednesday?: number[]
        }
        Relationships: []
      }
      times: {
        Row: {
          id: number
          timez: string
        }
        Insert: {
          id?: number
          timez: string
        }
        Update: {
          id?: number
          timez?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_buyer_confirmation: {
        Args: {
          meetup_id: string
        }
        Returns: undefined
      }
      check_user_by_email: {
        Args: {
          user_email: string
        }
        Returns: string
      }
      check_user_by_phone: {
        Args: {
          user_phone: string
        }
        Returns: string
      }
      clear_user_phone: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      update_expiry_for_id: {
        Args: {
          meetup_id_val: string
        }
        Returns: undefined
      }
      update_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      account_status: "complete" | "incomplete"
      condition: "new" | "used (like new)" | "used (good)" | "used (fair)"
      meetup_status:
        | "pending"
        | "meeting"
        | "confirmed"
        | "complete"
        | "canceled"
      meetup_type: "manual" | "campus"
      photo: "item" | "user"
      purchase_status:
        | "available"
        | "pending"
        | "meeting"
        | "confirmed"
        | "complete"
        | "canceled"
      status: "available" | "pending" | "bought" | "refunded"
      subject: "general" | "account" | "bugs" | "feature request" | "other"
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
