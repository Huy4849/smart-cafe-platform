const db = require('../config/db');

class DashboardRepository {
    async getDailyRevenue() {
        const { rows } = await db.query("SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].revenue) : 0;
    }
    
    async getTotalRevenue() {
        const { rows } = await db.query("SELECT COALESCE(SUM(total), 0) AS revenue FROM orders");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].revenue) : 0;
    }

    async getTotalCustomers() {
         const { rows } = await db.query("SELECT COUNT(id) AS count FROM customers");
         return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getTotalOrders() {
        const { rows } = await db.query("SELECT COUNT(id) AS count FROM orders");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getTopCustomers() {
        const { rows } = await db.query("SELECT id, name, phone, points, total_spent FROM customers ORDER BY total_spent DESC LIMIT 5");
        return rows;
    }
}

module.exports = new DashboardRepository();
