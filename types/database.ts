export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          currency: string;
          category: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          slug: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          position: number;
          alt: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]> & {
          product_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string | null;
          stock: number;
          sku: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["product_variants"]["Row"]> & {
          product_id: string;
          size: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
      };
      hero_videos: {
        Row: {
          id: string;
          label: string;
          desktop_url: string;
          mobile_url: string | null;
          dominant_color: string | null;
          position: number;
          status: "draft" | "processing" | "published";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["hero_videos"]["Row"]> & {
          label: string;
          desktop_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["hero_videos"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          customer_email: string;
          status: "pending" | "paid" | "shipped" | "cancelled";
          total: number;
          currency: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          customer_email: string;
          total: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          unit_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
    };
  };
};
