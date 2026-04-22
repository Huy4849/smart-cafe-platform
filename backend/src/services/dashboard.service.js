const dashboardRepository = require('../repositories/dashboard.repository');

class DashboardService {
    async getStats() {
        const [
            totalProjects, // Thực tế là totalDeals
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            chartData,
            recentTasks,
            upcomingDeadlines,
            projectsProgress, // Thực tế là dealsProgress
            activityData
        ] = await Promise.all([
            dashboardRepository.getTotalProjects(),
            dashboardRepository.getTotalTasks(),
            dashboardRepository.getCompletedTasks(),
            dashboardRepository.getPendingTasks(),
            dashboardRepository.getOverdueTasks(),
            dashboardRepository.getTaskStatusBreakdown(),
            dashboardRepository.getRecentTasks(),
            dashboardRepository.getUpcomingDeadlines(),
            dashboardRepository.getTasksByProject(),
            dashboardRepository.getActivityStats()
        ]);

        return {
            totalProjects,
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            chartData,
            recentTasks,
            upcomingDeadlines,
            projectsProgress,
            activityData
        };
    }
}

module.exports = new DashboardService();