-- =====================================================
-- DJAVU MySQL 8.0+ Schema (migrated from Supabase/PostgreSQL)
-- =====================================================
-- Notes:
-- 1) Supabase auth.users is replaced with app_users.
-- 2) PostgreSQL RLS/policies/functions were reworked to MySQL-compatible objects.
-- 3) UUIDs are stored as CHAR(36).
-- =====================================================

CREATE DATABASE IF NOT EXISTS djavu_netx CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE djavu_netx;

-- -----------------------------------------------------
-- Users (replacement for auth.users)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS app_users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified_at DATETIME NULL,
  raw_user_meta_data JSON NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Core domain
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(255) NULL,
  phone VARCHAR(60) NULL,
  address VARCHAR(255) NULL,
  city VARCHAR(120) NULL,
  postal_code VARCHAR(40) NULL,
  country VARCHAR(120) NOT NULL DEFAULT 'Cuba',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role ENUM('customer','sales_manager','sales_affiliate') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_roles_user_role (user_id, role),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wood_types (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NULL,
  price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  cost_per_cubic_meter DECIMAL(10,2) NOT NULL,
  image_url TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS finishes (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NULL,
  cost_per_square_meter DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS extras (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(140) NOT NULL UNIQUE,
  description TEXT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category ENUM('tables','chairs','beds','cabinets','shelving','desks') NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  wood_type_id CHAR(36) NULL,
  finish_id CHAR(36) NULL,
  dimensions_length DECIMAL(6,2) NULL,
  dimensions_width DECIMAL(6,2) NULL,
  dimensions_height DECIMAL(6,2) NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  images JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_wood_type FOREIGN KEY (wood_type_id) REFERENCES wood_types(id),
  CONSTRAINT fk_products_finish FOREIGN KEY (finish_id) REFERENCES finishes(id)
);

CREATE TABLE IF NOT EXISTS cost_sheets (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL DEFAULT 'Default',
  labor_rate_per_hour DECIMAL(10,2) NOT NULL DEFAULT 25.00,
  profit_margin_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00,
  overhead_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  complexity_multiplier_dining_table DECIMAL(4,2) NOT NULL DEFAULT 1.50,
  complexity_multiplier_coffee_table DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  complexity_multiplier_bookshelf DECIMAL(4,2) NOT NULL DEFAULT 1.20,
  complexity_multiplier_bed_frame DECIMAL(4,2) NOT NULL DEFAULT 1.40,
  complexity_multiplier_desk DECIMAL(4,2) NOT NULL DEFAULT 1.30,
  complexity_multiplier_cabinet DECIMAL(4,2) NOT NULL DEFAULT 1.60,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NULL,
  discount_type ENUM('percentage','fixed','free_shipping') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_uses INT NULL,
  uses_count INT NOT NULL DEFAULT 0,
  max_uses_per_user INT NOT NULL DEFAULT 1,
  applies_to ENUM('all','stock','custom') NOT NULL DEFAULT 'all',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  starts_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipping_methods (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id CHAR(36) PRIMARY KEY,
  invoice_number VARCHAR(80) NOT NULL UNIQUE,
  order_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(60) NULL,
  buyer_email VARCHAR(255) NULL,
  recipient_name VARCHAR(255) NULL,
  recipient_phone VARCHAR(60) NULL,
  recipient_address VARCHAR(255) NULL,
  items_detail JSON NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_invoices_user (user_id)
);

CREATE TABLE IF NOT EXISTS affiliates (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  referral_code VARCHAR(80) NOT NULL UNIQUE,
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  total_sales DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  pending_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_affiliates_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) PRIMARY KEY,
  order_number VARCHAR(80) NOT NULL UNIQUE,
  user_id CHAR(36) NULL,
  status ENUM('quote_generated','deposit_paid','in_production','manufactured','ready_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'quote_generated',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_paid TINYINT(1) NOT NULL DEFAULT 0,
  deposit_paid_at DATETIME NULL,
  remaining_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  balance_paid TINYINT(1) NOT NULL DEFAULT 0,
  balance_paid_at DATETIME NULL,
  payment_method ENUM('cash','bank_transfer','paypal_simulation','stripe_simulation') NOT NULL DEFAULT 'cash',
  buyer_name VARCHAR(255) NULL,
  buyer_phone VARCHAR(60) NULL,
  buyer_email VARCHAR(255) NULL,
  is_gift TINYINT(1) NOT NULL DEFAULT 0,
  shipping_name VARCHAR(255) NULL,
  shipping_phone VARCHAR(60) NULL,
  shipping_address VARCHAR(255) NULL,
  shipping_city VARCHAR(120) NULL,
  shipping_postal_code VARCHAR(40) NULL,
  shipping_country VARCHAR(120) NOT NULL DEFAULT 'Cuba',
  coupon_id CHAR(36) NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_method_id CHAR(36) NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  affiliate_id CHAR(36) NULL,
  invoice_id CHAR(36) NULL,
  notes TEXT NULL,
  estimated_delivery_date DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_shipping_method FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
);

ALTER TABLE invoices
  ADD CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_invoices_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NULL,
  is_custom TINYINT(1) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  custom_furniture_type ENUM('dining_table','coffee_table','bookshelf','bed_frame','desk','cabinet') NULL,
  custom_wood_type_id CHAR(36) NULL,
  custom_finish_id CHAR(36) NULL,
  custom_length DECIMAL(6,2) NULL,
  custom_width DECIMAL(6,2) NULL,
  custom_height DECIMAL(6,2) NULL,
  custom_extras JSON NULL,
  custom_notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_custom_wood FOREIGN KEY (custom_wood_type_id) REFERENCES wood_types(id),
  CONSTRAINT fk_order_items_custom_finish FOREIGN KEY (custom_finish_id) REFERENCES finishes(id)
);

CREATE TABLE IF NOT EXISTS service_orders (
  id CHAR(36) PRIMARY KEY,
  service_order_number VARCHAR(80) NOT NULL UNIQUE,
  order_id CHAR(36) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(60) NULL,
  customer_email VARCHAR(255) NULL,
  technical_specifications JSON NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  estimated_production_days INT NOT NULL DEFAULT 14,
  production_notes TEXT NULL,
  qr_code_data TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_orders_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  order_id CHAR(36) NULL,
  type VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  would_send_email TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupon_usage (
  id CHAR(36) PRIMARY KEY,
  coupon_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  order_id CHAR(36) NULL,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_usage_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id CHAR(36) PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  quantity_change INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  order_id CHAR(36) NULL,
  created_by CHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_stock_created_by FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(120) NULL,
  entity_id VARCHAR(120) NULL,
  details JSON NULL,
  ip_address VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id CHAR(36) PRIMARY KEY,
  affiliate_id CHAR(36) NOT NULL,
  order_id CHAR(36) NOT NULL,
  order_total DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  is_paid TINYINT(1) NOT NULL DEFAULT 0,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comm_affiliate FOREIGN KEY (affiliate_id) REFERENCES affiliates(id) ON DELETE CASCADE,
  CONSTRAINT fk_comm_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Number generators (MySQL triggers)
-- -----------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_orders_generate_number
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    SELECT COUNT(*) + 1 INTO seq FROM orders;
    SET NEW.order_number = CONCAT('DJ-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(seq, 4, '0'));
  END IF;
END$$

CREATE TRIGGER trg_service_orders_generate_number
BEFORE INSERT ON service_orders
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  IF NEW.service_order_number IS NULL OR NEW.service_order_number = '' THEN
    SELECT COUNT(*) + 1 INTO seq FROM service_orders;
    SET NEW.service_order_number = CONCAT('SO-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(seq, 4, '0'));
  END IF;
END$$

CREATE TRIGGER trg_invoices_generate_number
BEFORE INSERT ON invoices
FOR EACH ROW
BEGIN
  DECLARE seq INT;
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    SELECT COUNT(*) + 1 INTO seq FROM invoices;
    SET NEW.invoice_number = CONCAT('INV-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(seq, 4, '0'));
  END IF;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- Seed data
-- -----------------------------------------------------
INSERT INTO shipping_methods (id, name, description, cost, is_active)
VALUES
  (UUID(), 'Recoger en Taller', 'Recoge tu pedido en Colon #552, Santa Clara', 0, 1),
  (UUID(), 'Entrega Local (Santa Clara)', 'Entrega a domicilio dentro de Santa Clara', 150, 1),
  (UUID(), 'Envío Nacional', 'Coordinación manual de envío a nivel nacional', 300, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
