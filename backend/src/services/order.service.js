const orderRepository = require('../repositories/order.repository');
const db = require('../config/db');
const AppError = require('../utils/AppError');

class OrderService {
    async createOrder(userId, data) {
        const { customerId, items } = data;
        
        let total = 0;
        
        // Fetch actual prices
        for (const item of items) {
            const { rows } = await db.query("SELECT price FROM products WHERE id = $1", [item.product_id]);
            if (rows.length === 0) {
                throw new AppError(`Product with ID ${item.product_id} not found`, 404);
            }
            total += Number(rows[0].price) * Number(item.quantity);
        }

        const newOrder = await orderRepository.create(userId, customerId || null, total, items);
        return { message: "Order created successfully", order: newOrder };
    }
}

module.exports = new OrderService();