const db = require('../config/db');

class ProjectRepository {
    async findAll(ownerId, role, query = {}) {
        const { search, status, owner_id } = query;
        let sql = `
            SELECT p.*, d.title as deal_title, u.name as owner_name,
                   (SELECT COUNT(*)::int FROM tasks t WHERE t.project_id = p.id) as task_count,
                   (SELECT COUNT(*)::int FROM tasks t WHERE t.project_id = p.id AND t.status = 'Done') as completed_tasks
            FROM projects p
            LEFT JOIN deals d ON p.deal_id = d.id
            LEFT JOIN users u ON p.owner_id = u.id
            WHERE 1=1
        `;
        const params = [];

        // 1. Permission-based filtering
        if (role !== 'admin' && ownerId) {
            params.push(ownerId);
            sql += ` AND p.owner_id = $${params.length}`;
        }

        // 2. Explicit Owner filtering from UI
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += ` AND p.owner_id = $${params.length}`;
        }

        // 3. Status filtering
        if (status && status !== 'all') {
            params.push(status);
            sql += ` AND p.status = $${params.length}`;
        }

        // 4. Search filtering
        if (search) {
            params.push(`%${search}%`);
            sql += ` AND p.name ILIKE $${params.length}`;
        }

        sql += " ORDER BY p.created_at DESC";
        
        const { rows } = await db.query(sql, params);
        return (rows || []).map(row => ({
            ...row,
            budget: Number(row.budget)
        }));
    }

    async findById(id) {
        const { rows } = await db.query(`
            SELECT p.*, d.title as deal_title, u.name as owner_name
            FROM projects p
            LEFT JOIN deals d ON p.deal_id = d.id
            LEFT JOIN users u ON p.owner_id = u.id
            WHERE p.id = $1
        `, [id]);
        return rows[0];
    }

    async create(data) {
        const { 
            name, budget, status, deal_id, owner_id, 
            description, priority, category, health_status, 
            start_date, end_date 
        } = data;
        
        const { rows } = await db.query(
            `INSERT INTO projects (
                name, budget, status, deal_id, owner_id, 
                description, priority, category, health_status, 
                start_date, end_date
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                name, budget || 0, status || 'planned', deal_id || null, owner_id || null,
                description || null, priority || 'medium', category || null, health_status || 'on_track',
                start_date || null, end_date || null
            ]
        );
        return rows[0];
    }

    async update(id, data) {
        const { 
            name, budget, status, owner_id,
            description, priority, category, health_status,
            start_date, end_date
        } = data;
        
        const { rows } = await db.query(
            `UPDATE projects SET 
                name = $1, budget = $2, status = $3, owner_id = $4,
                description = $5, priority = $6, category = $7, health_status = $8,
                start_date = $9, end_date = $10, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $11 RETURNING *`,
            [
                name, budget, status, owner_id,
                description, priority, category, health_status,
                start_date || null, end_date || null, id
            ]
        );
        return rows[0];
    }

    async remove(id) {
        await db.query("DELETE FROM projects WHERE id = $1", [id]);
        return true;
    }
}

module.exports = new ProjectRepository();
