const orderService = require("../services/order.service");

exports.createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await orderService.createOrder(userId, req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};