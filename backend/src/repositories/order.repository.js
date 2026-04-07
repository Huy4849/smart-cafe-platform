const db = require('../config/db');

class OrderRepository {
    async create(userId, customerId, totalPrice, items) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            const { rows } = await client.query(
                "INSERT INTO orders (user_id, customer_id, total, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id",
                [userId, customerId, totalPrice]
            );
            
            const orderId = rows[0].id;
            
            // Insert order items
            for (const item of items) {
                await client.query(
                    "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)",
                    [orderId, item.id, item.quantity]
                );
            }
            
            // Update customer total_spent if customer_id exists
            if (customerId) {
                await client.query(
                    "UPDATE customers SET total_spent = total_spent + $1, points = points + ($1 / 1000) WHERE id = $2",
                    [totalPrice, customerId]
                );
            }

            await client.query('COMMIT');
            return { id: orderId, userId, customerId, total: totalPrice };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new OrderRepository();
