const db = require('../config/db');

class TaskRepository {
    async findAll(filters = {}) {
        const { status, dealId } = filters;
        const params = [];
        const conditions = [];

        if (status) {
            params.push(status);
            conditions.push(`t.status = $${params.length}`);
        }

        if (dealId) {
            params.push(dealId);
            conditions.push(`t.deal_id = $${params.length}`);
        }

        const sql = `
      SELECT t.*, d.title AS deal_title, u.name AS assigned_user_name
      FROM tasks t
      LEFT JOIN deals d ON t.deal_id = d.id
      LEFT JOIN users u ON t.assigned_user_id = u.id
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
      ORDER BY t.created_at DESC
    `;

        const { rows } = await db.query(sql, params);
        return rows;
    }

    async create(data) {
        const { title, type, priority, due_date, deal_id, assigned_user_id } = data;
        const priorityValue = priority || 'Medium';

        const { rows } = await db.query(
            'INSERT INTO tasks (title, type, status, priority, due_date, deal_id, assigned_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, type, 'Pending', priorityValue, due_date || null, deal_id || null, assigned_user_id || null]
        );
        return rows[0];
    }

    async update(id, data) {
        const { title, type, priority, due_date, deal_id, assigned_user_id } = data;
        const priorityValue = priority || 'Medium';

        const { rows } = await db.query(
            'UPDATE tasks SET title = $1, type = $2, priority = $3, due_date = $4, deal_id = $5, assigned_user_id = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
            [title, type, priorityValue, due_date || null, deal_id || null, assigned_user_id || null, id]
        );
        return rows[0];
    }

    async updateStatus(id, status) {
        const { rows } = await db.query(
            'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );
        return rows[0];
    }

    async remove(id) {
        await db.query('DELETE FROM tasks WHERE id = $1', [id]);
        return true;
    }
}

module.exports = new TaskRepository();
