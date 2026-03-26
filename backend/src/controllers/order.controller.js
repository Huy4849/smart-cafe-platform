const orderService = require("../services/order.service");

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id; // lấy từ JWT
        const items = req.body.items;

        const data = await orderService.createOrder(userId, items);

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};