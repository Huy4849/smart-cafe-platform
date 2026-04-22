const dashboardService = require('../services/dashboard.service');

exports.getStats = async (req, res, next) => {
    try {
        const data = await dashboardService.getStats();
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        next(error);
    }
};
