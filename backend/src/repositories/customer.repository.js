const db = require('../config/db');

class CustomerRepository {
    async findAll() {
        const { rows } = await db.query("SELECT * FROM customers ORDER BY total_spent DESC");
        return rows;
    }

    async findByPhone(phone) {
        const { rows } = await db.query("SELECT * FROM customers WHERE phone = $1", [phone]);
        return rows[0];
    }

    async create(data) {
        const { name, phone } = data;
        const { rows } = await db.query(
            "INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING *",
            [name, phone]
        );
        return rows[0];
    }

    async updateTotalSpent(id, amount) {
        const { rows } = await db.query(
            "UPDATE customers SET total_spent = total_spent + $1, points = points + ($1 / 1000) WHERE id = $2 RETURNING *",
            [amount, id]
        );
        return rows[0];
    }
}

module.exports = new CustomerRepository();
