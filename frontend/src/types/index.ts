export type Category = "granos" | "molinillos" | "tazas" | "accesorios";

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string | null;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface OrderResponse {
  id: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}
