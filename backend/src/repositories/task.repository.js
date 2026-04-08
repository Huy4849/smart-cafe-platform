const db = require('../config/db');

class TaskRepository {
    async findAll() {
        const { rows } = await db.query(`
            SELECT t.*, l.name as lead_name 
            FROM tasks t 
            LEFT JOIN leads l ON t.lead_id = l.id 
            ORDER BY t.created_at DESC
        `);
        return rows;
    }

    async create(data) {
        const { title, type, dueDate, leadId, assignedUserId } = data;
        const { rows } = await db.query(
            "INSERT INTO tasks (title, type, due_date, lead_id, assigned_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, type, dueDate || null, leadId || null, assignedUserId]
        );
        return rows[0];
    }

    async update(id, data) {
        const { title, type, due_date } = data;
        const { rows } = await db.query(
            "UPDATE tasks SET title = $1, type = $2, due_date = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
            [title, type, due_date, id]
        );
        return rows[0];
    }

    async updateStatus(id, status) {
        const { rows } = await db.query(
            "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );
        return rows[0];
    }

    async remove(id) {
        await db.query("DELETE FROM tasks WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new TaskRepository();
