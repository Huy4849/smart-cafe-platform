const db = require('../config/db');

class NoteRepository {
    async findByDeal(dealId) {
        const { rows } = await db.query(`
            SELECT n.*, u.name as author_name 
            FROM notes n 
            LEFT JOIN users u ON n.author_id = u.id 
            WHERE n.deal_id = $1 
            ORDER BY n.created_at DESC
        `, [dealId]);
        return rows;
    }

    async create(data) {
        const { content, dealId, authorId } = data;
        const { rows } = await db.query(
            "INSERT INTO notes (content, deal_id, author_id) VALUES ($1, $2, $3) RETURNING *",
            [content, dealId, authorId]
        );
        return rows[0];
    }
}

module.exports = new NoteRepository();
