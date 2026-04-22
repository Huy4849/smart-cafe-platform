const db = require('../config/db');

class DealRepository {
    async findAll(query = {}) {
        const { stage, search, owner_id } = query;
        let sql = `
            SELECT d.*, c.name as customer_name, u.name as owner_name
            FROM deals d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN users u ON d.owner_id = u.id
        `;
        const params = [];

        if (stage && stage !== 'all') {
            params.push(stage);
            sql += ` WHERE d.stage = $${params.length}`;
        }

        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += params.length === 1 ? " WHERE" : " AND";
            sql += ` d.owner_id = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            sql += params.length === 1 ? " WHERE" : " AND";
            sql += ` (d.title ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
        }

        sql += " ORDER BY d.created_at DESC";
        
        const { rows } = await db.query(sql, params);
        return (rows || []).map(row => ({
            ...row,
            value: Number(row.value),
            probability: Number(row.probability)
        }));
    }

    async findById(id) {
        const { rows } = await db.query(`
            SELECT d.*, c.name as customer_name, u.name as owner_name
            FROM deals d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN users u ON d.owner_id = u.id
            WHERE d.id = $1
        `, [id]);
        return rows[0];
    }

    async create(data) {
        const { 
            title, value, stage, priority, probability, expectedClosingDate, expected_closing_date,
            customerId, customer_id, ownerId, owner_id, nextStep, next_step 
        } = data;
        
        const finalCustomerId = customerId || customer_id;
        const finalOwnerId = ownerId || owner_id;
        const finalClosingDate = expectedClosingDate || expected_closing_date;
        const finalNextStep = nextStep || next_step || '';

        const { rows } = await db.query(
            `INSERT INTO deals (title, value, stage, priority, probability, expected_closing_date, customer_id, owner_id, next_step) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [title, value || 0, stage || 'Qualification', priority || 1, probability || 10, finalClosingDate || null, finalCustomerId, finalOwnerId, finalNextStep]
        );
        return rows[0];
    }

    async update(id, data) {
        const { 
            title, value, stage, priority, probability, expectedClosingDate, expected_closing_date,
            customerId, customer_id, ownerId, owner_id, nextStep, next_step 
        } = data;

        const finalCustomerId = customerId || customer_id;
        const finalOwnerId = ownerId || owner_id;
        const finalClosingDate = expectedClosingDate || expected_closing_date;
        const finalNextStep = nextStep || next_step;

        const { rows } = await db.query(
            `UPDATE deals SET 
                title = $1, value = $2, stage = $3, priority = $4, 
                probability = $5, expected_closing_date = $6, customer_id = $7, 
                owner_id = $8, next_step = $9, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $10 RETURNING *`,
            [title, value, stage, priority, probability, finalClosingDate, finalCustomerId, finalOwnerId, finalNextStep, id]
        );
        return rows[0];
    }

    async updateStage(id, stage) {
        const { rows } = await db.query(
            "UPDATE deals SET stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [stage, id]
        );
        return rows[0];
    }

    async remove(id) {
        await db.query("DELETE FROM deals WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new DealRepository();
