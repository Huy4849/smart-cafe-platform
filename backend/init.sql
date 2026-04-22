-- PostgreSQL database dump
SET client_encoding = 'UTF8';
SET default_transaction_isolation = 'read committed';
SET timezone = 'UTC';

-- Cleanup old tables if any
DROP TABLE IF EXISTS "notes" CASCADE;
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "leads" CASCADE;
DROP TABLE IF EXISTS "deals" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;

-- 1. BASE TABLES
CREATE TABLE "users" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notes" (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  deal_id INTEGER REFERENCES "deals"(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES "customers"(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES "users"(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CRM TABLES
CREATE TABLE "customers" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  company VARCHAR(150),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "leads" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  source VARCHAR(50),
  status VARCHAR(20) DEFAULT 'new',
  assigned_user_id INTEGER REFERENCES "users"(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "deals" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  value NUMERIC DEFAULT 0,
  stage VARCHAR(50) DEFAULT 'Qualification',
  priority INTEGER DEFAULT 1,
  probability INTEGER DEFAULT 10,
  next_step TEXT,
  expected_closing_date DATE,
  customer_id INTEGER REFERENCES "customers"(id) ON DELETE CASCADE,
  owner_id INTEGER REFERENCES "users"(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  probability_weighted_value NUMERIC GENERATED ALWAYS AS (value * (probability::numeric / 100)) STORED
);

CREATE TABLE "projects" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  budget NUMERIC DEFAULT 0,
  status VARCHAR(20) DEFAULT 'planned',
  deal_id INTEGER REFERENCES "deals"(id) ON DELETE SET NULL,
  owner_id INTEGER REFERENCES "users"(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tasks" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) DEFAULT 'Task',
  status VARCHAR(20) DEFAULT 'Pending',
  priority VARCHAR(20) DEFAULT 'Medium',
  due_date DATE,
  deal_id INTEGER REFERENCES "deals"(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES "projects"(id) ON DELETE CASCADE,
  assigned_user_id INTEGER REFERENCES "users"(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for SmartCRM
-- Sample data for SmartCRM (Massive Dataset for 100% Functionality)
INSERT INTO "users" (name, email, password, role) VALUES
('Nguyễn Thế Anh', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Trần Thị Lan', 'lan.crm@example.com', '$2b$10$.ASGuTgOlDf7WeHrPAqmF.E.hbpiYYwoZYryRaEJ2snk0eU6zvbW.', 'member'),
('Lê Hoàng Minh', 'minh.sales@example.com', '$2b$10$.ASGuTgOlDf7WeHrPAqmF.E.hbpiYYwoZYryRaEJ2snk0eU6zvbW.', 'member'),
('Phạm Tuyết Nhi', 'nhi.project@example.com', '$2b$10$.ASGuTgOlDf7WeHrPAqmF.E.hbpiYYwoZYryRaEJ2snk0eU6zvbW.', 'member'),
('Vũ Văn Hùng', 'hung.lead@example.com', '$2b$10$.ASGuTgOlDf7WeHrPAqmF.E.hbpiYYwoZYryRaEJ2snk0eU6zvbW.', 'member');

INSERT INTO "customers" (name, email, phone, company) VALUES
('Tập đoàn Cafe Trung Nguyên', 'contact@trungnguyen.com', '0281234567', 'Trung Nguyen Group'),
('Urban Coffee Station', 'info@urban.vn', '0287654321', 'Urban Coffee Co'),
('The Coffee House', 'hello@tch.vn', '0289998887', 'Seedcom Group'),
('Highlands Coffee', 'cs@highlands.com.vn', '0283332211', 'Jollibee'),
('Phúc Long Tea & Coffee', 'care@phuclong.com.vn', '0284445566', 'Masan Group');

INSERT INTO "leads" (name, email, phone, source) VALUES
('Lê Văn C', 'lead.c@gmail.com', '0900112233', 'Facebook Ads'),
('Phạm Thị D', 'lead.d@outlook.com', '0944556677', 'Referral'),
('Trần Hữu E', 'lead.e@vn.com', '0988776655', 'Direct'),
('Hoàng Thị F', 'lead.f@web.vn', '0911223344', 'Google Search');

-- deals (Title, Value, Stage, Probability, Next Step, Customer, Owner, Updated_at)
INSERT INTO "deals" (title, value, stage, priority, probability, next_step, customer_id, owner_id, updated_at) VALUES
('Cung cấp 50 máy pha cafe Espresso', 25000000, 'Won', 3, 100, 'Bàn giao và hướng dẫn', 1, 1, CURRENT_DATE - INTERVAL '5 days'),
('Hợp đồng hạt cafe Arabica hằng năm', 12000000, 'Won', 2, 100, 'Ký hợp đồng cung ứng', 2, 2, CURRENT_DATE - INTERVAL '15 days'),
('Setup quầy Bar trọn gói - CN Quận 1', 18500000, 'Negotiation', 3, 80, 'Thương thảo giá cuối', 1, 2, CURRENT_DATE - INTERVAL '2 days'),
('Cung cấp giải pháp phần mềm SmartCRM', 5000000, 'Won', 1, 100, 'Cấp tài khoản sử dụng', 3, 3, CURRENT_DATE - INTERVAL '35 days'),
('Gói bảo trì máy công suất lớn 2024', 4200000, 'Won', 2, 100, 'Lên lịch bảo trì', 4, 3, CURRENT_DATE - INTERVAL '40 days'),
('Thiết kế nội thất Cafe Sân vườn', 15000000, 'Won', 3, 100, 'Hoàn thành bản vẽ 3D', 5, 4, CURRENT_DATE - INTERVAL '70 days'),
('Dự án nhượng quyền thương hiệu Urban', 30000000, 'Qualification', 3, 20, 'Gửi profile năng lực', 2, 4, CURRENT_DATE),
('Cung cấp máy xay cafe công nghiệp', 8000000, 'Proposal', 2, 40, 'Gửi báo giá máy xay', 4, 5, CURRENT_DATE - INTERVAL '3 days'),
('Đào tạo Barista chuyên nghiệp - Gói 10 người', 3500000, 'Lost', 1, 0, 'Khách hàng chọn đơn vị khác', 3, 5, CURRENT_DATE - INTERVAL '10 days'),
('Nâng cấp hệ thống chiếu sáng Cafe', 2100000, 'Negotiation', 1, 75, 'Chốt màu đèn led', 5, 2, CURRENT_DATE),
('Hợp động thuê máy pha cafe tháng 04', 1500000, 'Won', 1, 100, 'Thu tiền cọc', 1, 2, CURRENT_DATE - INTERVAL '1 day');

-- tasks (title, type, status, due_date, deal_id, assigned_user_id)
INSERT INTO "tasks" (title, type, status, due_date, deal_id, assigned_user_id, updated_at) VALUES
('Gọi điện tư vấn khách hàng Trung Nguyên', 'Call', 'Pending', CURRENT_DATE + INTERVAL '1 day', 1, 1, CURRENT_DATE),
('Gửi báo giá máy pha cafe HighLands', 'Email', 'Done', CURRENT_DATE - INTERVAL '1 day', 2, 2, CURRENT_DATE - INTERVAL '1 day'),
('Họp chốt phương án thiết kế Urban', 'Meeting', 'Done', CURRENT_DATE - INTERVAL '2 days', 3, 2, CURRENT_DATE - INTERVAL '2 day'),
('Kiểm tra kho hạt cafe Arabica', 'Internal', 'Done', CURRENT_DATE - INTERVAL '5 days', 2, 3, CURRENT_DATE - INTERVAL '5 days'),
('Gửi hợp đồng phần mềm cho Seedcom', 'Email', 'Pending', CURRENT_DATE + INTERVAL '2 days', 4, 3, CURRENT_DATE),
('Khảo sát mặt bằng Phúc Long Tân Bình', 'Call', 'Done', CURRENT_DATE - INTERVAL '4 days', 6, 4, CURRENT_DATE - INTERVAL '4 days'),
('Update tiến độ thi công quầy Bar', 'Update', 'Done', CURRENT_DATE - INTERVAL '1 day', 3, 4, CURRENT_DATE - INTERVAL '1 day'),
('Follow up dự án nhượng quyền', 'Call', 'Pending', CURRENT_DATE + INTERVAL '5 days', 7, 5, CURRENT_DATE);
