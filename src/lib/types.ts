// Djavu - Definiciones de Tipos

export type AppRole = "customer" | "sales_manager" | "sales_affiliate";

export type OrderStatus =
  | "quote_generated"
  | "deposit_paid"
  | "in_production"
  | "manufactured"
  | "ready_for_delivery"
  | "delivered"
  | "cancelled";

export type FurnitureCategory =
  | "tables"
  | "chairs"
  | "beds"
  | "cabinets"
  | "shelving"
  | "desks";

export type FurnitureType =
  | "dining_table"
  | "coffee_table"
  | "bookshelf"
  | "bed_frame"
  | "desk"
  | "cabinet";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface WoodType {
  id: string;
  name: string;
  description: string | null;
  price_multiplier: number;
  cost_per_cubic_meter: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Finish {
  id: string;
  name: string;
  description: string | null;
  cost_per_square_meter: number;
  is_active: boolean;
  created_at: string;
}

export interface Extra {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: FurnitureCategory;
  base_price: number;
  wood_type_id: string | null;
  finish_id: string | null;
  dimensions_length: number | null;
  dimensions_width: number | null;
  dimensions_height: number | null;
  stock_quantity: number;
  is_featured: boolean;
  is_active: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
  // Datos relacionados
  wood_type?: WoodType;
  finish?: Finish;
}

export interface CostSheet {
  id: string;
  name: string;
  labor_rate_per_hour: number;
  profit_margin_percentage: number;
  overhead_percentage: number;
  complexity_multiplier_dining_table: number;
  complexity_multiplier_coffee_table: number;
  complexity_multiplier_bookshelf: number;
  complexity_multiplier_bed_frame: number;
  complexity_multiplier_desk: number;
  complexity_multiplier_cabinet: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  remaining_balance: number;
  balance_paid: boolean;
  balance_paid_at: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  notes: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  // Datos relacionados
  items?: OrderItem[];
  service_order?: ServiceOrder;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  is_custom: boolean;
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_furniture_type: FurnitureType | null;
  custom_wood_type_id: string | null;
  custom_finish_id: string | null;
  custom_length: number | null;
  custom_width: number | null;
  custom_height: number | null;
  custom_extras: string[];
  custom_notes: string | null;
  created_at: string;
  // Datos relacionados
  product?: Product;
  custom_wood_type?: WoodType;
  custom_finish?: Finish;
}

export interface ServiceOrder {
  id: string;
  service_order_number: string;
  order_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  technical_specifications: Record<string, unknown>;
  total_price: number;
  deposit_paid: number;
  remaining_balance: number;
  estimated_production_days: number;
  production_notes: string | null;
  qr_code_data: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  would_send_email: boolean;
  created_at: string;
}

// Tipos del carrito (lado cliente)
export interface CartItem {
  id: string;
  type: "standard" | "custom";
  product?: Product;
  customConfig?: CustomFurnitureConfig;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomFurnitureConfig {
  furnitureType: FurnitureType;
  woodType: WoodType;
  finish: Finish;
  length: number;
  width: number;
  height: number;
  extras: Extra[];
  notes?: string;
}

// Etiquetas de estado de pedido
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  quote_generated: "Presupuesto Generado",
  deposit_paid: "Anticipo Pagado",
  in_production: "En Producción",
  manufactured: "Fabricado",
  ready_for_delivery: "Listo para Entrega",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  quote_generated: "bg-yellow-100 text-yellow-800",
  deposit_paid: "bg-blue-100 text-blue-800",
  in_production: "bg-purple-100 text-purple-800",
  manufactured: "bg-indigo-100 text-indigo-800",
  ready_for_delivery: "bg-green-100 text-green-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export const FURNITURE_TYPE_LABELS: Record<FurnitureType, string> = {
  dining_table: "Mesa de Comedor",
  coffee_table: "Mesa de Centro",
  bookshelf: "Estantería",
  bed_frame: "Estructura de Cama",
  desk: "Escritorio",
  cabinet: "Armario",
};

export const FURNITURE_CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  tables: "Mesas",
  chairs: "Sillas",
  beds: "Camas",
  cabinets: "Armarios",
  shelving: "Estanterías",
  desks: "Escritorios",
};
