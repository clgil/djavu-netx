-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('customer', 'sales_manager');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM (
  'quote_generated',
  'deposit_paid',
  'in_production',
  'manufactured',
  'ready_for_delivery',
  'delivered',
  'cancelled'
);

-- Create furniture_category enum
CREATE TYPE public.furniture_category AS ENUM (
  'tables',
  'chairs',
  'beds',
  'cabinets',
  'shelving',
  'desks'
);

-- Create furniture_type enum for custom orders
CREATE TYPE public.furniture_type AS ENUM (
  'dining_table',
  'coffee_table',
  'bookshelf',
  'bed_frame',
  'desk',
  'cabinet'
);

-- User Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Portugal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Wood Types table
CREATE TABLE public.wood_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  cost_per_cubic_meter DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Finishes table
CREATE TABLE public.finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  cost_per_square_meter DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extras table
CREATE TABLE public.extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table (standard furniture items)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category furniture_category NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  wood_type_id UUID REFERENCES public.wood_types(id),
  finish_id UUID REFERENCES public.finishes(id),
  dimensions_length DECIMAL(6,2),
  dimensions_width DECIMAL(6,2),
  dimensions_height DECIMAL(6,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost Sheet table (admin-configurable pricing)
CREATE TABLE public.cost_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Default',
  labor_rate_per_hour DECIMAL(10,2) NOT NULL DEFAULT 25.00,
  profit_margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  overhead_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  complexity_multiplier_dining_table DECIMAL(4,2) NOT NULL DEFAULT 1.5,
  complexity_multiplier_coffee_table DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  complexity_multiplier_bookshelf DECIMAL(4,2) NOT NULL DEFAULT 1.2,
  complexity_multiplier_bed_frame DECIMAL(4,2) NOT NULL DEFAULT 1.4,
  complexity_multiplier_desk DECIMAL(4,2) NOT NULL DEFAULT 1.3,
  complexity_multiplier_cabinet DECIMAL(4,2) NOT NULL DEFAULT 1.6,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'quote_generated',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_paid BOOLEAN NOT NULL DEFAULT false,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  remaining_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance_paid BOOLEAN NOT NULL DEFAULT false,
  balance_paid_at TIMESTAMP WITH TIME ZONE,
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'Portugal',
  notes TEXT,
  estimated_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order Items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  -- Custom item specifications
  custom_furniture_type furniture_type,
  custom_wood_type_id UUID REFERENCES public.wood_types(id),
  custom_finish_id UUID REFERENCES public.finishes(id),
  custom_length DECIMAL(6,2),
  custom_width DECIMAL(6,2),
  custom_height DECIMAL(6,2),
  custom_extras UUID[] DEFAULT '{}',
  custom_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service Orders table (auto-generated after deposit payment)
CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  technical_specifications JSONB NOT NULL DEFAULT '{}',
  total_price DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  estimated_production_days INTEGER NOT NULL DEFAULT 14,
  production_notes TEXT,
  qr_code_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table (simulated email notifications)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  would_send_email BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wood_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.orders;
  new_number := 'WC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$;

-- Function to generate service order number
CREATE OR REPLACE FUNCTION public.generate_service_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.service_orders;
  new_number := 'SO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$;

-- Trigger to auto-generate order number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Trigger to auto-generate service order number
CREATE OR REPLACE FUNCTION public.set_service_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.service_order_number IS NULL OR NEW.service_order_number = '' THEN
    NEW.service_order_number := public.generate_service_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_service_order_number
  BEFORE INSERT ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_service_order_number();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_sheets_updated_at
  BEFORE UPDATE ON public.cost_sheets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Sales managers can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- User Roles: Users can view their own roles, sales managers can view all
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sales managers can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Sales managers can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Wood Types: Public read, sales manager write
CREATE POLICY "Anyone can view active wood types"
  ON public.wood_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sales managers can manage wood types"
  ON public.wood_types FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Finishes: Public read, sales manager write
CREATE POLICY "Anyone can view active finishes"
  ON public.finishes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sales managers can manage finishes"
  ON public.finishes FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Extras: Public read, sales manager write
CREATE POLICY "Anyone can view active extras"
  ON public.extras FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sales managers can manage extras"
  ON public.extras FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Products: Public read, sales manager write
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sales managers can manage products"
  ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Cost Sheets: Only sales managers
CREATE POLICY "Sales managers can view cost sheets"
  ON public.cost_sheets FOR SELECT
  USING (public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Sales managers can manage cost sheets"
  ON public.cost_sheets FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Orders: Users see own orders, sales managers see all
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Sales managers can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Sales managers can manage all orders"
  ON public.orders FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Order Items: Follow order policies
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Sales managers can manage all order items"
  ON public.order_items FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Service Orders: Users see own, sales managers see all
CREATE POLICY "Users can view own service orders"
  ON public.service_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = service_orders.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Sales managers can manage all service orders"
  ON public.service_orders FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));

-- Notifications: Users see own
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Sales managers can manage all notifications"
  ON public.notifications FOR ALL
  USING (public.has_role(auth.uid(), 'sales_manager'));