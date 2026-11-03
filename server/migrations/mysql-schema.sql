CREATE TABLE IF NOT EXISTS users (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  username VARCHAR(191) NOT NULL UNIQUE,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(191) NOT NULL,
  first_name VARCHAR(191) NOT NULL,
  last_name VARCHAR(191) NOT NULL,
  phone VARCHAR(191),
  active BOOLEAN NOT NULL,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stations (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  code VARCHAR(191) NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city VARCHAR(191),
  phone VARCHAR(191),
  tax_id VARCHAR(191),
  manager_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  active BOOLEAN NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_stations_manager FOREIGN KEY (manager_id) REFERENCES users(id)
) ENGINE=InnoDB;

ALTER TABLE users
  ADD CONSTRAINT fk_users_station FOREIGN KEY (station_id) REFERENCES stations(id);

CREATE TABLE IF NOT EXISTS products (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  code VARCHAR(191) NOT NULL UNIQUE,
  category VARCHAR(191) NOT NULL,
  purchase_price DOUBLE NOT NULL,
  selling_price DOUBLE NOT NULL,
  vat_rate DOUBLE NOT NULL,
  unit_of_measure VARCHAR(191) NOT NULL,
  min_stock_alert DOUBLE NOT NULL,
  current_stock DOUBLE NOT NULL,
  active BOOLEAN NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  code VARCHAR(191) UNIQUE,
  contact_person VARCHAR(191),
  phone VARCHAR(191),
  email VARCHAR(191),
  address TEXT,
  tax_id VARCHAR(191),
  active BOOLEAN NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  phone VARCHAR(191),
  email VARCHAR(191),
  address TEXT,
  credit_balance DOUBLE NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teams (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  name VARCHAR(191) NOT NULL UNIQUE,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  leader_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  active BOOLEAN NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_teams_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_teams_leader FOREIGN KEY (leader_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS team_members (
  team_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position INT NOT NULL,
  user_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (team_id, position),
  CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id),
  CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pumps (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  pump_number VARCHAR(191) NOT NULL,
  active BOOLEAN NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_pumps_station FOREIGN KEY (station_id) REFERENCES stations(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pump_pistols (
  pump_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position INT NOT NULL,
  pistol_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  pistol_number INT NOT NULL,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  current_closing_index DOUBLE NOT NULL,
  active BOOLEAN NOT NULL,
  PRIMARY KEY (pump_id, position),
  UNIQUE KEY uq_pump_pistols_id (pistol_id),
  CONSTRAINT fk_pump_pistols_pump FOREIGN KEY (pump_id) REFERENCES pumps(id),
  CONSTRAINT fk_pump_pistols_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tanks (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  tank_number VARCHAR(191) NOT NULL,
  capacity DOUBLE NOT NULL,
  current_stock DOUBLE NOT NULL,
  min_level_alert DOUBLE NOT NULL,
  active BOOLEAN NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_tanks_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_tanks_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shifts (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  shift_type VARCHAR(191) NOT NULL,
  shift_date DATETIME(3) NOT NULL,
  shift_number INT NOT NULL,
  status VARCHAR(191) NOT NULL,
  opened_by_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  closed_by_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  team_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  total_sales_ht DOUBLE NOT NULL,
  total_vat DOUBLE NOT NULL,
  total_sales_ttc DOUBLE NOT NULL,
  total_profit DOUBLE NOT NULL,
  cash_amount DOUBLE NOT NULL,
  bank_card_amount DOUBLE NOT NULL,
  fuel_card_amount DOUBLE NOT NULL,
  bank_transfer_amount DOUBLE NOT NULL,
  credit_amount DOUBLE NOT NULL,
  total_payments DOUBLE NOT NULL,
  balance DOUBLE NOT NULL,
  is_balanced BOOLEAN NOT NULL,
  total_expenses DOUBLE NOT NULL,
  opened_at DATETIME(3) NOT NULL,
  closed_at DATETIME(3) NULL,
  notes TEXT,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  UNIQUE KEY uq_shifts_station_date_type (station_id, shift_date, shift_type),
  KEY ix_shifts_date (shift_date),
  CONSTRAINT fk_shifts_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_shifts_opened_by FOREIGN KEY (opened_by_id) REFERENCES users(id),
  CONSTRAINT fk_shifts_closed_by FOREIGN KEY (closed_by_id) REFERENCES users(id),
  CONSTRAINT fk_shifts_team FOREIGN KEY (team_id) REFERENCES teams(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shift_employees (
  shift_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position INT NOT NULL,
  user_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (shift_id, position),
  CONSTRAINT fk_shift_employees_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_shift_employees_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shift_pump_readings (
  shift_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position INT NOT NULL,
  pump_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  pump_number VARCHAR(191) NOT NULL,
  PRIMARY KEY (shift_id, position),
  CONSTRAINT fk_shift_pump_readings_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_shift_pump_readings_pump FOREIGN KEY (pump_id) REFERENCES pumps(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shift_pistol_readings (
  shift_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  pump_position INT NOT NULL,
  position INT NOT NULL,
  pistol_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  pistol_number INT NOT NULL,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  product_name VARCHAR(191) NOT NULL,
  product_code VARCHAR(191) NOT NULL,
  purchase_price DOUBLE NOT NULL,
  selling_price DOUBLE NOT NULL,
  vat_rate DOUBLE NOT NULL,
  opening_index DOUBLE NOT NULL,
  closing_index DOUBLE NOT NULL,
  volume_sold DOUBLE NOT NULL,
  amount_ht DOUBLE NOT NULL,
  vat_amount DOUBLE NOT NULL,
  amount_ttc DOUBLE NOT NULL,
  profit DOUBLE NOT NULL,
  PRIMARY KEY (shift_id, pump_position, position),
  CONSTRAINT fk_shift_pistol_readings_pump_reading
    FOREIGN KEY (shift_id, pump_position) REFERENCES shift_pump_readings(shift_id, position),
  CONSTRAINT fk_shift_pistol_readings_pistol FOREIGN KEY (pistol_id) REFERENCES pump_pistols(pistol_id),
  CONSTRAINT fk_shift_pistol_readings_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shift_product_volumes (
  shift_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position INT NOT NULL,
  volume_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  product_name VARCHAR(191),
  volume_sold DOUBLE NOT NULL,
  PRIMARY KEY (shift_id, position),
  CONSTRAINT fk_shift_product_volumes_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_shift_product_volumes_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sales (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  shift_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  pump_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  pistol_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  customer_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  product_name VARCHAR(191) NOT NULL,
  product_code VARCHAR(191) NOT NULL,
  employee_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  quantity DOUBLE NOT NULL,
  purchase_price DOUBLE NOT NULL,
  selling_price DOUBLE NOT NULL,
  vat_rate DOUBLE NOT NULL,
  amount_ht DOUBLE NOT NULL,
  vat_amount DOUBLE NOT NULL,
  amount_ttc DOUBLE NOT NULL,
  profit DOUBLE NOT NULL,
  payment_method VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NULL,
  mongo_version INT NULL,
  KEY ix_sales_created_at (created_at),
  KEY ix_sales_shift (shift_id),
  CONSTRAINT fk_sales_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_sales_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_sales_pump FOREIGN KEY (pump_id) REFERENCES pumps(id),
  CONSTRAINT fk_sales_pistol FOREIGN KEY (pistol_id) REFERENCES pump_pistols(pistol_id),
  CONSTRAINT fk_sales_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_sales_employee FOREIGN KEY (employee_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchase_orders (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  supplier_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  order_number VARCHAR(191) NOT NULL UNIQUE,
  order_date DATETIME(3) NOT NULL,
  delivery_date DATETIME(3) NULL,
  status VARCHAR(191) NOT NULL,
  total_amount DOUBLE NOT NULL,
  notes TEXT,
  created_by_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  delivered_by VARCHAR(191),
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_purchase_orders_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  CONSTRAINT fk_purchase_orders_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_purchase_orders_created_by FOREIGN KEY (created_by_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchase_order_items (
  purchase_order_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  position INT NOT NULL,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  quantity DOUBLE NOT NULL,
  unit_price DOUBLE NOT NULL,
  total_price DOUBLE NOT NULL,
  tank_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  PRIMARY KEY (purchase_order_id, position),
  CONSTRAINT fk_purchase_order_items_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  CONSTRAINT fk_purchase_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_purchase_order_items_tank FOREIGN KEY (tank_id) REFERENCES tanks(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expenses (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  supplier_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  type VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  amount DOUBLE NOT NULL,
  paid BOOLEAN NOT NULL,
  notes TEXT,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_expenses_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_expenses_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS kif_returns (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  shift_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  return_date DATETIME(3) NOT NULL,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  quantity DOUBLE NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  operator_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_kif_returns_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_kif_returns_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_kif_returns_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_kif_returns_operator FOREIGN KEY (operator_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tank_gaugings (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  tank_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  gauged_at DATETIME(3) NOT NULL,
  dip_reading DOUBLE NOT NULL,
  calculated_volume DOUBLE NOT NULL,
  water_level DOUBLE NOT NULL,
  temperature DOUBLE NOT NULL,
  theoretical_stock DOUBLE NOT NULL,
  variance DOUBLE NOT NULL,
  operator_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  notes TEXT,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  KEY ix_tank_gaugings_tank_date (tank_id, gauged_at),
  KEY ix_tank_gaugings_station_date (station_id, gauged_at),
  CONSTRAINT fk_tank_gaugings_tank FOREIGN KEY (tank_id) REFERENCES tanks(id),
  CONSTRAINT fk_tank_gaugings_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_tank_gaugings_operator FOREIGN KEY (operator_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS daily_closures (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  closure_date DATETIME(3) NOT NULL,
  status VARCHAR(191) NOT NULL,
  sales_ttc DOUBLE NOT NULL,
  total_payments DOUBLE NOT NULL,
  total_expenses DOUBLE NOT NULL,
  total_purchases DOUBLE NOT NULL,
  total_kif_quantity DOUBLE NOT NULL,
  variance DOUBLE NOT NULL,
  is_balanced BOOLEAN NOT NULL,
  notes TEXT,
  closed_by_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  closed_at DATETIME(3) NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  UNIQUE KEY uq_daily_closures_station_date (station_id, closure_date),
  CONSTRAINT fk_daily_closures_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_daily_closures_closed_by FOREIGN KEY (closed_by_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS day_closures (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  closure_date DATETIME(3) NOT NULL,
  status VARCHAR(191) NOT NULL,
  closed_by_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  reopened_by_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  notes TEXT,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  UNIQUE KEY uq_day_closures_station_date (station_id, closure_date),
  CONSTRAINT fk_day_closures_station FOREIGN KEY (station_id) REFERENCES stations(id),
  CONSTRAINT fk_day_closures_closed_by FOREIGN KEY (closed_by_id) REFERENCES users(id),
  CONSTRAINT fk_day_closures_reopened_by FOREIGN KEY (reopened_by_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_purchases (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  product_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  supplier VARCHAR(191),
  quantity DOUBLE NOT NULL,
  unit_cost DOUBLE NOT NULL,
  total_cost DOUBLE NOT NULL,
  notes TEXT,
  created_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_product_purchases_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_product_purchases_station FOREIGN KEY (station_id) REFERENCES stations(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS credit_transactions (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  customer_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  station_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  type VARCHAR(191) NOT NULL,
  reference_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  amount DOUBLE NOT NULL,
  notes TEXT,
  created_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_credit_transactions_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_credit_transactions_station FOREIGN KEY (station_id) REFERENCES stations(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  token VARCHAR(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  expires_at DATETIME(3) NOT NULL,
  revoked BOOLEAN NOT NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  user_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  action VARCHAR(191) NOT NULL,
  status VARCHAR(191) NOT NULL,
  message TEXT,
  metadata JSON NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  setting_key VARCHAR(191) NOT NULL UNIQUE,
  value JSON NOT NULL,
  type VARCHAR(191) NOT NULL,
  category VARCHAR(191) NOT NULL,
  description TEXT,
  updated_by_id CHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
  created_at DATETIME(3) NULL,
  updated_at DATETIME(3) NULL,
  mongo_version INT NULL,
  CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by_id) REFERENCES users(id)
) ENGINE=InnoDB;
