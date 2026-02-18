
-- ========================================
-- DJAVU: Complete Database Extension
-- ========================================

-- 1. Add 'sales_affiliate' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_affiliate';

-- 2. Payment method enum
CREATE TYPE public.payment_method AS ENUM (
  'cash',
  'bank_transfer',
  'paypal_simulation',
  'stripe_simulation'
);

-- 3. Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer,
  uses_count integer NOT NULL DEFAULT 0,
  max_uses_per_user integer DEFAULT 1,
  applies_to text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'stock', 'custom')),
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons by code" ON public.coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sales managers can manage coupons" ON public.coupons
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- 4. Coupon usage tracking
CREATE TABLE public.coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sales managers can manage coupon usage" ON public.coupon_usage
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- 5. Shipping methods
CREATE TABLE public.shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cost numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shipping methods" ON public.shipping_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sales managers can manage shipping methods" ON public.shipping_methods
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- 6. Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid,
  buyer_name text NOT NULL,
  buyer_phone text,
  buyer_email text,
  recipient_name text,
  recipient_phone text,
  recipient_address text,
  items_detail jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  shipping_cost numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  deposit_paid numeric NOT NULL DEFAULT 0,
  remaining_balance numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sales managers can manage invoices" ON public.invoices
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- Invoice number generator
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.invoices;
  new_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$;

-- 7. Stock movements log
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_change integer NOT NULL,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  reason text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales managers can manage stock movements" ON public.stock_movements
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- 8. Activity logs
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales managers can view activity logs" ON public.activity_logs
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- 9. Affiliates table
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  referral_code text NOT NULL UNIQUE,
  commission_percentage numeric NOT NULL DEFAULT 5,
  is_approved boolean NOT NULL DEFAULT false,
  total_sales numeric NOT NULL DEFAULT 0,
  total_commission numeric NOT NULL DEFAULT 0,
  pending_commission numeric NOT NULL DEFAULT 0,
  paid_commission numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sales managers can manage affiliates" ON public.affiliates
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- 10. Affiliate commissions
CREATE TABLE public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_total numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  is_paid boolean NOT NULL DEFAULT false,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own commissions" ON public.affiliate_commissions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.affiliates WHERE affiliates.id = affiliate_commissions.affiliate_id AND affiliates.user_id = auth.uid()
  ));

CREATE POLICY "Sales managers can manage commissions" ON public.affiliate_commissions
  FOR ALL USING (has_role(auth.uid(), 'sales_manager'::app_role));

-- 11. Extend orders table with new columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS buyer_name text,
  ADD COLUMN IF NOT EXISTS buyer_phone text,
  ADD COLUMN IF NOT EXISTS buyer_email text,
  ADD COLUMN IF NOT EXISTS is_gift boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id),
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_method_id uuid REFERENCES public.shipping_methods(id),
  ADD COLUMN IF NOT EXISTS shipping_cost numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliates(id),
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id);

-- 12. Seed shipping methods for Cuba
INSERT INTO public.shipping_methods (name, description, cost) VALUES
  ('Recoger en Taller', 'Recoge tu pedido en Colon #552, Santa Clara', 0),
  ('Entrega Local (Santa Clara)', 'Entrega a domicilio dentro de Santa Clara', 150),
  ('Envío Nacional', 'Coordinación manual de envío a nivel nacional', 300);

-- 13. Update profiles default country to Cuba
ALTER TABLE public.profiles ALTER COLUMN country SET DEFAULT 'Cuba';

-- 14. Update orders default country to Cuba
ALTER TABLE public.orders ALTER COLUMN shipping_country SET DEFAULT 'Cuba';

-- 15. Trigger for affiliate updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
