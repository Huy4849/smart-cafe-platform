const dashboardRepository = require('../repositories/dashboard.repository');

class DashboardService {
    async getStats() {
        const [totalLeads, totalDeals, totalRevenue, recentDeals, chartData] = await Promise.all([
            dashboardRepository.getTotalLeads(),
            dashboardRepository.getTotalDeals(),
            dashboardRepository.getTotalExpectedRevenue(),
            dashboardRepository.getRecentDeals(),
            dashboardRepository.getRevenueByStage()
        ]);

        return {
            totalLeads,
            totalDeals,
            totalRevenue,
            recentDeals,
            chartData
        };
    }
}

module.exports = new DashboardService();