const dashboardService = require("../services/dashboard.service");

exports.getStats = async (req, res) => {
    const data = await dashboardService.getStats();
    res.json(data);
};