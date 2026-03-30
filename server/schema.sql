CREATE DATABASE IF NOT EXISTS multivendor;
USE multivendor;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  approved TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sellers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(40) DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_seller FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sub_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  seller_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(40) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sub_orders_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_orders_seller FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sub_order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sub_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  CONSTRAINT fk_sub_order_items_sub_order FOREIGN KEY (sub_order_id) REFERENCES sub_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sub_order_id INT NOT NULL,
  rate DECIMAL(5, 4) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_commissions_sub_order FOREIGN KEY (sub_order_id) REFERENCES sub_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  sub_order_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(40) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payouts_seller FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  CONSTRAINT fk_payouts_sub_order FOREIGN KEY (sub_order_id) REFERENCES sub_orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS disputes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sub_order_id INT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_disputes_sub_order FOREIGN KEY (sub_order_id) REFERENCES sub_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY,
  commission_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.1000,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO platform_settings (id, commission_rate)
VALUES (1, 0.1000)
ON DUPLICATE KEY UPDATE commission_rate = VALUES(commission_rate);
