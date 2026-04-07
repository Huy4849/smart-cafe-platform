const db = require('../config/db');

class ProductRepository {
    async findPaginated(limit, offset) {
        const { rows } = await db.query(
            "SELECT * FROM products LIMIT $1 OFFSET $2",
            [limit, offset]
        );
        return rows;
    }

    async create(productData) {
        const { name, price, category } = productData;
        const { rows } = await db.query(
            "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
            [name, price, category]
        );
        return rows[0];
    }

    async searchByName(keyword) {
        const { rows } = await db.query(
            "SELECT * FROM products WHERE name ILIKE $1",
            [`%${keyword}%`]
        );
        return rows;
    }
}

module.exports = new ProductRepository();
