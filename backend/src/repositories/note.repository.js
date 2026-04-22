const db = require('../config/db');

class NoteRepository {
    async findByTask(taskId) {
        const { rows } = await db.query(`
            SELECT n.*, u.name as author_name
            FROM notes n
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.task_id = $1
            ORDER BY n.created_at DESC
        `, [taskId]);
        return rows;
    }

    async create(data) {
        const { content, taskId, authorId } = data;
        const { rows } = await db.query(
            "INSERT INTO notes (content, task_id, author_id) VALUES ($1, $2, $3) RETURNING *",
            [content, taskId, authorId]
        );
        return rows[0];
    }
}

module.exports = new NoteRepository();
