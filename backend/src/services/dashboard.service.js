const db = require("../config/db");

exports.getStats = async () => {
    const totalOrders = await db.query("SELECT COUNT(*) FROM orders");
    const revenue = await db.query("SELECT SUM(total) FROM orders");

    return {
        totalOrders: totalOrders.rows[0].count,
        revenue: revenue.rows[0].sum || 0,
    };
};