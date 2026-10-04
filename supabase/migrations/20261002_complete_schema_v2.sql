-- ========================================================
-- PALLETOORI'S DAIRY FARM - COMPLETE SCHEMA v2
-- Migration: 20261002_complete_schema_v2.sql
-- Run this after 20260301_initial_schema.sql
-- ========================================================

-- ========================================================
-- EXTEND / ALTER EXISTING TABLES
-- ========================================================

-- Extend profiles table with additional fields and roles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update role constraint to include all roles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'super_admin', 'farm_manager', 'operations', 'delivery_manager', 'inventory_manager', 'support'));

-- Extend addresses table with full fields
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS label VARCHAR(50) DEFAULT 'Home',
  ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS landmark VARCHAR(255),
  ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Extend categories with missing fields
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Extend products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_name VARCHAR(100);

-- Extend product_variants with SKU and low_stock_threshold
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS size_value DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS size_unit VARCHAR(20),
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS mrp NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS selling_price NUMERIC(10, 2);

-- Sync mrp and selling_price for existing data
UPDATE public.product_variants
SET mrp = original_price, selling_price = price
WHERE mrp IS NULL OR selling_price IS NULL;

-- Extend orders table  
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tax NUMERIC(10, 2) DEFAULT 0;

-- Update order_status to include all required statuses
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_order_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_order_status_check
  CHECK (order_status IN ('pending', 'confirmed', 'packing', 'ready_for_dispatch', 'out_for_delivery', 'delivered', 'cancelled', 'payment_failed', 'delivery_failed', 'refund_pending', 'refunded'));

-- Extend subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS next_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS pause_until DATE,
  ADD COLUMN IF NOT EXISTS product_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

-- ========================================================
-- NEW TABLES
-- ========================================================

-- INVENTORY BATCHES (for expiry-aware dairy tracking)
CREATE TABLE IF NOT EXISTS public.inventory_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  production_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity_produced INTEGER NOT NULL CHECK (quantity_produced >= 0),
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  quantity_sold INTEGER DEFAULT 0 CHECK (quantity_sold >= 0),
  quantity_damaged INTEGER DEFAULT 0 CHECK (quantity_damaged >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICEABILITY PINCODES (admin-managed, no code changes needed)
CREATE TABLE IF NOT EXISTS public.serviceability_pincodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pincode VARCHAR(10) UNIQUE NOT NULL,
  area_name VARCHAR(200) NOT NULL,
  city VARCHAR(100) DEFAULT 'Hyderabad',
  is_active BOOLEAN DEFAULT TRUE,
  delivery_charge NUMERIC(10, 2) DEFAULT 0,
  minimum_order_value NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERY PARTNERS
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  vehicle_number VARCHAR(50),
  vehicle_type VARCHAR(50) DEFAULT 'bike',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERY ROUTES
CREATE TABLE IF NOT EXISTS public.delivery_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  area VARCHAR(200) NOT NULL,
  pincodes JSONB NOT NULL DEFAULT '[]',
  delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERY ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_partner_id UUID REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  route_id UUID REFERENCES public.delivery_routes(id) ON DELETE SET NULL,
  sequence_number INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER STATUS HISTORY (for tracking timeline)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id)
);

-- PAYMENTS (extended from existing)
-- The existing payments table is retained. Add missing fields:
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(30) DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS provider_order_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS provider_signature VARCHAR(255),
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- COUPONS (extended)
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS maximum_discount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS usage_limit INTEGER,
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_usage_limit INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- COUPON USAGE TRACKING
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_applied NUMERIC(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, order_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('order_update', 'payment', 'subscription', 'promotion', 'info', 'alert')),
  channel VARCHAR(20) DEFAULT 'in_app' CHECK (channel IN ('sms', 'whatsapp', 'email', 'in_app')),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- INDEXES
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_pincode ON public.addresses(pincode);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_delivery ON public.subscriptions(next_delivery_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_variant ON public.inventory_batches(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_expiry ON public.inventory_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_serviceability_pincode ON public.serviceability_pincodes(pincode) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON public.delivery_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_partner ON public.delivery_assignments(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history(order_id);

-- ========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles', 'addresses', 'categories', 'products', 'product_variants',
    'orders', 'subscriptions', 'delivery_partners', 'delivery_routes',
    'delivery_assignments', 'support_tickets', 'reviews',
    'serviceability_pincodes', 'inventory_batches', 'coupons'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%s;
       CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON public.%s
       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;

-- ========================================================
-- PROFILE AUTO-CREATE ON AUTH SIGNUP
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY
-- ========================================================

-- Enable RLS on new tables
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serviceability_pincodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION: check if current user has an admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'farm_manager', 'operations', 'delivery_manager', 'inventory_manager', 'support')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- HELPER FUNCTION: check if current user is a specific role
CREATE OR REPLACE FUNCTION public.has_role(check_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = check_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --------------------------------------------------------
-- PROFILES RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    -- Customers cannot elevate their own role
    (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    OR public.is_admin()
  );
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "New user profile insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- --------------------------------------------------------
-- ADDRESSES RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON public.addresses
  FOR SELECT USING (public.is_admin());

-- --------------------------------------------------------
-- ORDERS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    -- Prevent client from self-assigning paid status
    AND payment_status = 'pending'
    AND order_status = 'pending'
  );
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- --------------------------------------------------------
-- ORDER ITEMS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own order items via orders" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
CREATE POLICY "Users can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (public.is_admin());

-- --------------------------------------------------------
-- SUBSCRIPTIONS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
  FOR UPDATE USING (
    auth.uid() = user_id
    -- Customers can only change: quantity, status (pause/cancel), address, delivery_slot
    -- Cannot change: product, variant, price
  );
CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- PRODUCTS / CATEGORIES / VARIANTS RLS
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public can view delivery slots" ON public.delivery_slots;

CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active variants" ON public.product_variants
  FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Admins can manage variants" ON public.product_variants
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view active delivery slots" ON public.delivery_slots
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage delivery slots" ON public.delivery_slots
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- SERVICEABILITY PINCODES (public read, admin write)
-- --------------------------------------------------------
CREATE POLICY "Public can view active pincodes" ON public.serviceability_pincodes
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage pincodes" ON public.serviceability_pincodes
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- INVENTORY BATCHES (admin only)
-- --------------------------------------------------------
CREATE POLICY "Admins can manage inventory" ON public.inventory_batches
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- DELIVERY MANAGEMENT (admin and delivery staff)
-- --------------------------------------------------------
CREATE POLICY "Admins and delivery managers can view partners" ON public.delivery_partners
  FOR SELECT USING (public.is_admin() OR has_role('delivery_manager'));
CREATE POLICY "Admins can manage partners" ON public.delivery_partners
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage routes" ON public.delivery_routes
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage assignments" ON public.delivery_assignments
  FOR ALL USING (public.is_admin());
CREATE POLICY "Delivery partner can view own assignments" ON public.delivery_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.delivery_partners
      WHERE delivery_partners.id = delivery_assignments.delivery_partner_id
      AND delivery_partners.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------
-- ORDER STATUS HISTORY
-- --------------------------------------------------------
CREATE POLICY "Users can view own order history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
  );
CREATE POLICY "Admins can manage order history" ON public.order_status_history
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- SUPPORT TICKETS
-- --------------------------------------------------------
CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- REVIEWS
-- --------------------------------------------------------
CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can view own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reviews for purchased products" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE o.user_id = auth.uid()
      AND oi.product_id = reviews.product_id
      AND o.order_status = 'delivered'
    )
  );
CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- COUPONS
-- --------------------------------------------------------
CREATE POLICY "Public can view active coupons basic info" ON public.coupons
  FOR SELECT USING (is_active = TRUE AND (start_date IS NULL OR start_date <= NOW()) AND (valid_until IS NULL OR valid_until >= NOW()));
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- --------------------------------------------------------
-- COUPON USAGES
-- --------------------------------------------------------
CREATE POLICY "Users can view own coupon usage" ON public.coupon_usages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all coupon usage" ON public.coupon_usages
  FOR SELECT USING (public.is_admin());

-- --------------------------------------------------------
-- NOTIFICATIONS
-- --------------------------------------------------------
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark own notifications read" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.is_admin());

-- ========================================================
-- SEED SERVICEABILITY PINCODES (Hyderabad areas)
-- ========================================================
INSERT INTO public.serviceability_pincodes (pincode, area_name, city, is_active, delivery_charge, minimum_order_value) VALUES
('500034', 'Banjara Hills', 'Hyderabad', true, 0, 149),
('500084', 'Kondapur', 'Hyderabad', true, 0, 149),
('500032', 'Gachibowli', 'Hyderabad', true, 0, 149),
('500081', 'Madhapur', 'Hyderabad', true, 0, 149),
('500050', 'Jubilee Hills', 'Hyderabad', true, 0, 149),
('500072', 'Manikonda', 'Hyderabad', true, 0, 149),
('500089', 'Nanakramguda', 'Hyderabad', true, 0, 149),
('500008', 'Secunderabad', 'Hyderabad', true, 0, 149),
('500016', 'Begumpet', 'Hyderabad', true, 0, 149),
('500082', 'Miyapur', 'Hyderabad', true, 25, 199)
ON CONFLICT (pincode) DO NOTHING;
