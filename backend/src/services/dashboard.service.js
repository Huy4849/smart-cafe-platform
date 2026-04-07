const dashboardRepository = require('../repositories/dashboard.repository');

class DashboardService {
    async getStats() {
        const [dailyRevenue, totalRevenue, totalCustomers, totalOrders, topCustomers] = await Promise.all([
            dashboardRepository.getDailyRevenue(),
            dashboardRepository.getTotalRevenue(),
            dashboardRepository.getTotalCustomers(),
            dashboardRepository.getTotalOrders(),
            dashboardRepository.getTopCustomers()
        ]);

        return {
            dailyRevenue,
            totalRevenue,
            totalCustomers,
            totalOrders,
            topCustomers
        };
    }
}

module.exports = new DashboardService();