const db = require('../config/db');

class DashboardRepository {
    async getTotalProjects() {
        // Trong CRM, "Projects" tương đương với tổng số Deals
        const { rows } = await db.query("SELECT COUNT(*) AS count FROM deals");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getTotalTasks() {
        // Tổng số hoạt động chăm sóc khách hàng
        const { rows } = await db.query("SELECT COUNT(*) AS count FROM tasks");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getCompletedTasks() {
        const { rows } = await db.query("SELECT COUNT(*) AS count FROM tasks WHERE status = 'Done'");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getPendingTasks() {
        const { rows } = await db.query("SELECT COUNT(*) AS count FROM tasks WHERE status = 'Pending'");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getOverdueTasks() {
        const { rows } = await db.query("SELECT COUNT(*) AS count FROM tasks WHERE status != 'Done' AND due_date < CURRENT_DATE");
        return Array.isArray(rows) && rows.length > 0 ? Number(rows[0].count) : 0;
    }

    async getTaskStatusBreakdown() {
        const { rows } = await db.query(`
      SELECT status AS name, COUNT(*) AS total
      FROM tasks
      GROUP BY status
      ORDER BY status
    `);
        return (rows || []).map((row) => ({ name: row.name, total: Number(row.total) }));
    }

    async getRecentTasks() {
        const { rows } = await db.query(`
      SELECT t.id, t.title, t.status, t.due_date, d.title AS project_name
      FROM tasks t
      LEFT JOIN deals d ON t.deal_id = d.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);
        return rows || [];
    }

    async getUpcomingDeadlines() {
        const { rows } = await db.query(`
      SELECT t.id, t.title, t.status, t.due_date, d.title AS project_name
      FROM tasks t
      LEFT JOIN deals d ON t.deal_id = d.id
      WHERE t.status != 'Done' AND t.due_date IS NOT NULL AND t.due_date >= CURRENT_DATE
      ORDER BY t.due_date ASC
      LIMIT 5
    `);
        return rows || [];
    }

    async getTasksByProject() {
        // Thống kê tiến độ theo Thương vụ (Deals)
        const { rows } = await db.query(`
      SELECT d.title as name, 
             COUNT(t.id) as total_tasks,
             COUNT(CASE WHEN t.status = 'Done' THEN 1 END) as completed_tasks
      FROM deals d
      LEFT JOIN tasks t ON d.id = t.deal_id
      GROUP BY d.id, d.title
      ORDER BY total_tasks DESC
      LIMIT 5
    `);
        return (rows || []).map(row => ({
            name: row.name,
            total: Number(row.total_tasks),
            completed: Number(row.completed_tasks),
            percentage: row.total_tasks > 0 ? Math.round((row.completed_tasks * 100) / row.total_tasks) : 0
        }));
    }

    async getActivityStats() {
        const { rows } = await db.query(`
      WITH RECURSIVE last_7_days AS (
        SELECT CURRENT_DATE - INTERVAL '6 days' as day_date
        UNION ALL
        SELECT day_date + INTERVAL '1 day'
        FROM last_7_days
        WHERE day_date < CURRENT_DATE
      )
      SELECT 
        TO_CHAR(d.day_date, 'DD/MM') as date,
        COUNT(t.id) as count
      FROM last_7_days d
      LEFT JOIN tasks t ON TO_CHAR(t.updated_at, 'YYYY-MM-DD') = TO_CHAR(d.day_date, 'YYYY-MM-DD')
        AND t.status = 'Done'
      GROUP BY d.day_date
      ORDER BY d.day_date ASC
    `);
        return rows || [];
    }
}

module.exports = new DashboardRepository();
