const db = require('../config/db');

class ReportRepository {
    getPeriodFragment(period) {
        switch (period) {
            case 'quarter': return "DATE_TRUNC('quarter', CURRENT_DATE)";
            case 'year': return "DATE_TRUNC('year', CURRENT_DATE)";
            case 'month':
            default: return "DATE_TRUNC('month', CURRENT_DATE)";
        }
    }

    async getCompletionStats(period = 'month', owner_id = null) {
        const periodStart = this.getPeriodFragment(period);
        let sql = `SELECT stage as status, COUNT(*)::int as count FROM deals WHERE updated_at >= ${periodStart}`;
        const params = [];
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += ` AND owner_id = $${params.length}`;
        }
        sql += ` GROUP BY stage`;
        const { rows } = await db.query(sql, params);
        return rows || [];
    }

    async getTeamPerformance(period = 'month', owner_id = null) {
        const periodStart = this.getPeriodFragment(period);
        let sql = `
            SELECT u.id, u.name, COALESCE(SUM(d.value), 0)::float as revenue
            FROM users u
            LEFT JOIN deals d ON u.id = d.owner_id AND d.stage = 'Won' AND d.updated_at >= ${periodStart}
            WHERE 1=1
        `;
        const params = [];
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += ` AND u.id = $${params.length}`;
        }
        sql += ` GROUP BY u.id, u.name ORDER BY revenue DESC LIMIT 5`;
        const { rows } = await db.query(sql, params);
        return rows || [];
    }

    async getProjectBudgetAnalysis(period = 'month', owner_id = null) {
        const periodStart = this.getPeriodFragment(period);
        let sql = `SELECT stage as name, COALESCE(SUM(value), 0)::float as budget, COUNT(*)::int as task_count FROM deals WHERE updated_at >= ${periodStart}`;
        const params = [];
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += ` AND owner_id = $${params.length}`;
        }
        sql += ` GROUP BY stage ORDER BY budget DESC`;
        const { rows } = await db.query(sql, params);
        return rows || [];
    }

    async getPriorityDistribution(period = 'month', owner_id = null) {
        const periodStart = this.getPeriodFragment(period);
        let sql = `
            SELECT 
                CASE WHEN priority >= 3 THEN 'High' WHEN priority = 2 THEN 'Medium' ELSE 'Low' END as priority, 
                COUNT(*)::int as count
            FROM deals
            WHERE updated_at >= ${periodStart}
        `;
        const params = [];
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += ` AND owner_id = $${params.length}`;
        }
        sql += ` GROUP BY 1 ORDER BY count DESC`;
        const { rows } = await db.query(sql, params);
        return rows || [];
    }

    async getRecentActivities(owner_id = null) {
        let sql = `
            SELECT 
                t.id, t.title, t.status, t.updated_at, 
                COALESCE(d.title, 'Yêu cầu chung') as deal_name, 
                COALESCE(p.name, 'Nhiệm vụ lẻ') as project_name,
                p.id as project_id,
                COALESCE(u.name, 'Hệ thống') as author_name
            FROM tasks t
            LEFT JOIN deals d ON t.deal_id = d.id
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u ON t.assigned_user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += ` AND (t.assigned_user_id = $${params.length} OR d.owner_id = $${params.length} OR p.owner_id = $${params.length})`;
        }
        sql += ` ORDER BY t.updated_at DESC LIMIT 10`;
        const { rows } = await db.query(sql, params);
        return rows || [];
    }

    async getMonthlyRevenueTrend(period = 'month', owner_id = null) {
        let interval = '6 months';
        let format = 'Mon';
        let truncUnit = 'month';
        
        if (period === 'quarter') { 
            interval = '12 months'; 
            format = 'Q/YYYY'; 
            truncUnit = 'quarter';
        } else if (period === 'year') { 
            interval = '5 years'; 
            format = 'YYYY'; 
            truncUnit = 'year';
        }

        let nameExpression = `TO_CHAR(updated_at, '${format}')`;
        if (period === 'month') {
            nameExpression = `'Thg ' || TO_CHAR(updated_at, 'MM')`;
        } else if (period === 'quarter') {
            nameExpression = `'Quý ' || TO_CHAR(updated_at, 'Q/YYYY')`;
        }

        const params = [];
        let ownerFilter = '';
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            ownerFilter = ` AND owner_id = $1`;
        }

        let sql = `
            SELECT ${nameExpression} as name, COALESCE(SUM(value), 0)::float as revenue
            FROM deals
            WHERE stage = 'Won' AND updated_at >= CURRENT_DATE - INTERVAL '${interval}' ${ownerFilter}
            GROUP BY 1, DATE_TRUNC('${truncUnit}', updated_at)
            ORDER BY DATE_TRUNC('${truncUnit}', updated_at) ASC
        `;
        const { rows } = await db.query(sql, params);
        return rows || [];
    }

    async getGrowthMetrics(period = 'month', owner_id = null) {
        const truncUnit = period === 'month' ? 'month' : period === 'quarter' ? 'quarter' : 'year';
        const intervalUnits = period === 'month' ? '1 month' : period === 'quarter' ? '3 month' : '1 year';
        let sql = `
            SELECT 
                COALESCE(SUM(CASE WHEN DATE_TRUNC('${truncUnit}', updated_at) = DATE_TRUNC('${truncUnit}', CURRENT_DATE) THEN value ELSE 0 END), 0)::float as current_period,
                COALESCE(SUM(CASE WHEN DATE_TRUNC('${truncUnit}', updated_at) = DATE_TRUNC('${truncUnit}', CURRENT_DATE - INTERVAL '${intervalUnits}') THEN value ELSE 0 END), 0)::float as last_period
            FROM deals
            WHERE stage = 'Won'
        `;
        const params = [];
        if (owner_id && owner_id !== 'all') {
            params.push(owner_id);
            sql += ` AND owner_id = $${params.length}`;
        }
        const { rows } = await db.query(sql, params);
        const stats = rows[0] || { current_period: 0, last_period: 0 };
        const growth = stats.last_period > 0 
            ? ((stats.current_period - stats.last_period) / stats.last_period) * 100 
            : (stats.current_period > 0 ? 100 : 0);
        
        return {
            currentMonthRevenue: stats.current_period,
            lastMonthRevenue: stats.last_period,
            growthPercentage: parseFloat(growth).toFixed(1)
        };
    }
    
    async getDatabaseMetadata() {
        const sql = `
            SELECT 
                (SELECT COUNT(*)::int FROM users) as users_count,
                (SELECT COUNT(*)::int FROM deals) as deals_count,
                (SELECT COUNT(*)::int FROM customers) as customers_count,
                (SELECT COUNT(*)::int FROM projects) as projects_count,
                (SELECT COUNT(*)::int FROM tasks) as tasks_count,
                (SELECT pg_size_pretty(pg_database_size(current_database()))) as db_size
        `;
        const { rows } = await db.query(sql);
        return rows[0] || {
            users_count: 0,
            deals_count: 0,
            customers_count: 0,
            projects_count: 0,
            tasks_count: 0,
            db_size: '0 MB'
        };
    }
}

module.exports = new ReportRepository();
