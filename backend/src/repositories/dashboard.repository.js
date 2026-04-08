const db = require('../config/db');

class DashboardRepository {
    async getTotalLeads() {
        const { rows } = await db.query("SELECT COUNT(*) AS count FROM leads");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }
    
    async getTotalDeals() {
        const { rows } = await db.query("SELECT COUNT(*) AS count FROM deals");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getTotalExpectedRevenue() {
         const { rows } = await db.query("SELECT COALESCE(SUM(value), 0) AS revenue FROM deals");
         return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].revenue) : 0;
    }

    async getRecentDeals() {
        const { rows } = await db.query("SELECT id, title, value, stage FROM deals ORDER BY created_at DESC LIMIT 5");
        return rows;
    }

    async getRevenueByStage() {
        const { rows } = await db.query(`
            SELECT stage as name, SUM(value) as total 
            FROM deals 
            GROUP BY stage
        `);
        return rows.map(r => ({ name: r.name, total: Number(r.total) }));
    }
}

module.exports = new DashboardRepository();
