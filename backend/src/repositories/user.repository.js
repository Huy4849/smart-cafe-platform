const db = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0];
    }

    async findById(id) {
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0];
    }

    async create(userData) {
        const { name, email, password } = userData;
        const { rows } = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role',
            [name, email, password]
        );
        return rows[0];
    }

    async update(id, data) {
        const { name, role } = data;
        const { rows } = await db.query(
            'UPDATE users SET name = $1, role = $2 WHERE id = $3 RETURNING id, name, email, role',
            [name, role, id]
        );
        return rows[0];
    }

    async updatePassword(id, hashedPassword) {
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
        return true;
    }
}

module.exports = new UserRepository();
