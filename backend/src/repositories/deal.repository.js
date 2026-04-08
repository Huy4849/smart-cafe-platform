const db = require('../config/db');

class DealRepository {
    async findAll() {
        const { rows } = await db.query(`
            SELECT d.*, l.name as lead_name 
            FROM deals d 
            LEFT JOIN leads l ON d.lead_id = l.id 
            ORDER BY d.created_at DESC
        `);
        return rows;
    }

    async create(data) {
        const { title, value, stage, leadId, priority, probability, expectedClosingDate, colorIndex } = data;
        const { rows } = await db.query(
            "INSERT INTO deals (title, value, stage, priority, probability, expected_closing_date, color_index, lead_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [title, value || 0, stage || 'Proposal', priority || 0, probability || 10, expectedClosingDate || null, colorIndex || 0, leadId]
        );
        return rows[0];
    }

    async update(id, data) {
        const { title, value, priority, probability, expected_closing_date, color_index } = data;
        const { rows } = await db.query(
            "UPDATE deals SET title = $1, value = $2, priority = $3, probability = $4, expected_closing_date = $5, color_index = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
            [title, value, priority, probability, expected_closing_date, color_index, id]
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
