const reportRepository = require('../repositories/report.repository');

exports.getReportSummary = async (req, res, next) => {
    try {
        const { period = 'month', owner_id = 'all' } = req.query;

        const [
            completionStats, 
            teamPerformance, 
            budgetAnalysis, 
            priorityDistribution, 
            recentActivities,
            revenueTrend,
            growthMetrics
        ] = await Promise.all([
            reportRepository.getCompletionStats(period, owner_id),
            reportRepository.getTeamPerformance(period, owner_id),
            reportRepository.getProjectBudgetAnalysis(period, owner_id),
            reportRepository.getPriorityDistribution(period, owner_id),
            reportRepository.getRecentActivities(owner_id),
            reportRepository.getMonthlyRevenueTrend(period, owner_id),
            reportRepository.getGrowthMetrics(period, owner_id)
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                completionStats,
                teamPerformance,
                budgetAnalysis,
                priorityDistribution,
                recentActivities,
                revenueTrend,
                growthMetrics,
                revenueGoal: 25000000 // Thống nhất mục tiêu doanh thu 25 triệu VND
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getSystemStats = async (req, res, next) => {
    try {
        const stats = await reportRepository.getDatabaseMetadata();
        res.status(200).json({ status: 'success', data: stats });
    } catch (err) { next(err); }
};

exports.downloadBackup = async (req, res, next) => {
    try {
        const metadata = await reportRepository.getDatabaseMetadata();
        const timestamp = new Date().toISOString();
        
        let sqlDump = `-- SmartCRM SQL Backup\n-- Generated: ${timestamp}\n-- User: ${req.user.name}\n\n`;
        sqlDump += `-- Database Size: ${metadata.db_size}\n`;
        sqlDump += `-- Users: ${metadata.users_count}\n`;
        sqlDump += `-- Deals: ${metadata.deals_count}\n\n`;
        sqlDump += `SET client_encoding = 'UTF8';\n\n`;
        sqlDump += `-- [SIMULATED BACKUP DATA]\n`;
        sqlDump += `INSERT INTO backup_logs (user_id, status) VALUES (${req.user.id}, 'Success');\n`;
        
        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename=SmartCRM-Backup-${new Date().toISOString().split('T')[0]}.sql`);
        res.send(sqlDump);
    } catch (err) { next(err); }
};
