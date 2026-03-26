const db = require("../config/db");

exports.createOrder = async (userId, items) => {
    // tính tổng tiền
    let total = 0;

    for (const item of items) {
        const result = await db.query(
            "SELECT price FROM products WHERE id = $1",
            [item.product_id]
        );

        const price = result.rows[0].price;
        total += price * item.quantity;
    }

    // tạo order
    const orderResult = await db.query(
        "INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *",
        [userId, total]
    );

    const orderId = orderResult.rows[0].id;

    // tạo order_items
    for (const item of items) {
        await db.query(
            "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)",
            [orderId, item.product_id, item.quantity]
        );
    }

    return { message: "Order created", orderId };
};