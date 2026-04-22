const db = require('../config/db');

class CustomerRepository {
    async findAll(query = {}) {
        const { search, status } = query;
        let sql = `
            SELECT c.*, 
                   COUNT(d.id) as total_deals,
                   COALESCE(SUM(CASE WHEN d.stage = 'Won' THEN d.value ELSE 0 END), 0) as total_revenue
            FROM customers c
            LEFT JOIN deals d ON c.id = d.customer_id
        `;
        const params = [];

        if (status && status !== 'all') {
            params.push(status);
            sql += ` WHERE c.status = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            sql += params.length === 1 ? " WHERE" : " AND";
            sql += ` (c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.company ILIKE $${params.length})`;
        }

        sql += " GROUP BY c.id ORDER BY c.created_at DESC";
        
        const { rows } = await db.query(sql, params);
        return rows.map(r => ({
            ...r,
            total_deals: Number(r.total_deals),
            total_revenue: Number(r.total_revenue)
        }));
    }

    async findById(id) {
        const { rows } = await db.query("SELECT * FROM customers WHERE id = $1", [id]);
        return rows[0];
    }

    async create(data) {
        const { name, email, phone, company, status } = data;
        const { rows } = await db.query(
            "INSERT INTO customers (name, email, phone, company, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, email, phone, company, status || 'active']
        );
        return rows[0];
    }

    async update(id, data) {
        const { name, email, phone, company, status } = data;
        const { rows } = await db.query(
            "UPDATE customers SET name = $1, email = $2, phone = $3, company = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            [name, email, phone, company, status, id]
        );
        return rows[0];
    }

    async remove(id) {
        await db.query("DELETE FROM customers WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new CustomerRepository();
