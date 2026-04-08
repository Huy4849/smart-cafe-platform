-- PostgreSQL database dump
SET client_encoding = 'UTF8';
SET default_transaction_isolation = 'read committed';
SET timezone = 'UTC';

-- Cleanup old tables if any
DROP TABLE IF EXISTS "tasks" CASCADE;
DROP TABLE IF EXISTS "deals" CASCADE;
DROP TABLE IF EXISTS "leads" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;

-- 1. USERS TABLE
CREATE TABLE "users" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. LEADS TABLE
CREATE TABLE "leads" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    source VARCHAR(50), -- e.g., Website, Referral, Ads
    status VARCHAR(20) DEFAULT 'New', -- New, Contacted, Qualified, Lost
    assigned_user_id INTEGER REFERENCES "users"(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEALS TABLE
CREATE TABLE "deals" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    value NUMERIC DEFAULT 0,
    stage VARCHAR(50) DEFAULT 'Proposal', -- Proposal, Negotiation, Won, Lost
    priority INTEGER DEFAULT 0, -- 0-3 Stars
    probability NUMERIC DEFAULT 10, -- 0-100 %
    expected_closing_date DATE,
    color_index INTEGER DEFAULT 0,
    lead_id INTEGER REFERENCES "leads"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TASKS TABLE
CREATE TABLE "tasks" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50) DEFAULT 'Call', -- Call, Email, Meeting
    status VARCHAR(20) DEFAULT 'Pending', -- Pending, Done
    due_date TIMESTAMP,
    lead_id INTEGER REFERENCES "leads"(id) ON DELETE CASCADE,
    assigned_user_id INTEGER REFERENCES "users"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. NOTES (CHATTER) TABLE
CREATE TABLE "notes" (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    deal_id INTEGER REFERENCES "deals"(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES "users"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DUMMY DATA FOR GRADUATION PROJECT (CRM SYSTEM)
INSERT INTO "users" (name, email, password, role) VALUES 
('Admin / Tác giả', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Sale NV1', 'sale1@example.com', '$2b$10$.ASGuTgOlDf7WeHrPAqmF.E.hbpiYYwoZYryRaEJ2snk0eU6zvbW.', 'sales');

INSERT INTO "leads" (name, email, phone, source, status, assigned_user_id) VALUES 
('Công ty ABC', 'contact@abc.vn', '0912345678', 'Website', 'Qualified', 1),
('Anh Hiếu IT', 'hieu@tech.io', '0988777666', 'Referral', 'New', 1),
('Chị Hằng HR', 'hang.hr@company.com', '0123456789', 'Ads', 'Contacted', 2),
('Tập đoàn Global Corp', 'global@corp.com', '02833445566', 'Website', 'Qualified', 1),
('Shop Quần áo Mây', 'may.shop@gmail.com', '0933112233', 'Ads', 'New', 1),
('Cửa hàng Gia dụng Việt', 'gd.viet@outlook.com', '0901223344', 'Referral', 'Contacted', 2),
('Trường học Sáng Tạo', 'edu.st@school.vn', '02455667788', 'Website', 'Qualified', 1),
('Quán Cafe Gió', 'gio.cafe@gmail.com', '0911223344', 'Ads', 'Lost', 1);

INSERT INTO "deals" (title, value, stage, priority, probability, color_index, lead_id) VALUES 
('Cung cấp phần mềm nội bộ', 150000000, 'Negotiation', 3, 80, 1, 1),
('Thuê mướn Server 1 năm', 30000000, 'Won', 1, 100, 2, 1),
('Bảo trì mạng VPS', 5000000, 'Proposal', 0, 30, 0, 2),
('Triển khai ERP trọn gói', 500000000, 'Negotiation', 3, 40, 1, 4),
('Gói tư vấn chuyển đổi số', 45000000, 'Proposal', 2, 10, 3, 7),
('Bản quyền Office 365', 12000000, 'Won', 1, 100, 2, 6),
('Hệ thống POS bán hàng', 25000000, 'Won', 2, 100, 0, 5),
('Gói Marketing quý 4', 60000000, 'Lost', 1, 0, 4, 3);

INSERT INTO "notes" (content, deal_id, author_id) VALUES
('Khách hàng yêu cầu giảm giá 10%, chuẩn bị lên lịch meeting.', 1, 1),
('Đã gửi tài liệu brochure qua email.', 1, 2),
('Cần follow up gấp vì đối thủ đang chào giá thấp hơn.', 4, 1);

INSERT INTO "tasks" (title, type, status, due_date, lead_id, assigned_user_id) VALUES 
('Gọi điện báo giá cho ABC', 'Call', 'Pending', CURRENT_TIMESTAMP + INTERVAL '1 day', 1, 1),
('Gặp anh Hiếu tư vấn', 'Meeting', 'Done', CURRENT_TIMESTAMP - INTERVAL '2 days', 2, 1),
('Gửi email chào hàng Global Corp', 'Email', 'Pending', CURRENT_TIMESTAMP + INTERVAL '2 hours', 4, 1),
('Họp team chốt deal ERP', 'Meeting', 'Pending', CURRENT_TIMESTAMP + INTERVAL '3 days', 4, 2);
