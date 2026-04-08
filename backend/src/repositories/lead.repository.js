const db = require('../config/db');

class LeadRepository {
    async findAll() {
        const { rows } = await db.query("SELECT * FROM leads ORDER BY created_at DESC");
        return rows;
    }

    async create(data) {
        const { name, email, phone, source, status, assignedUserId } = data;
        const { rows } = await db.query(
            "INSERT INTO leads (name, email, phone, source, status, assigned_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, email, phone, source, status, assignedUserId]
        );
        return rows[0];
    }

    async remove(id) {
        await db.query("DELETE FROM leads WHERE id = $1", [id]);
        return true;
    }

    async update(id, data) {
        const { name, email, phone, source, status } = data;
        const { rows } = await db.query(
            "UPDATE leads SET name = $1, email = $2, phone = $3, source = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
            [name, email, phone, source, status, id]
        );
        return rows[0];
    }
}

module.exports = new LeadRepository();
