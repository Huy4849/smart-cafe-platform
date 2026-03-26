const db = require("../config/db");
const redis = require("../config/redis");

exports.getProducts = async (page = 1, limit = 5) => {
    const cacheKey = `products:${page}:${limit}`;

    // 👉 check cache
    const cached = await redis.get(cacheKey);

    if (cached) {
        console.log("⚡ Redis cache HIT");
        return JSON.parse(cached);
    }

    console.log("🐢 DB query");

    const offset = (page - 1) * limit;

    const result = await db.query(
        "SELECT * FROM products LIMIT $1 OFFSET $2",
        [limit, offset]
    );

    // 👉 save cache
    await redis.set(cacheKey, JSON.stringify(result.rows), {
        EX: 60, // cache 60s
    });

    return result.rows;
};

exports.createProduct = async ({ name, price, category }) => {
    await db.query(
        "INSERT INTO products (name, price, category) VALUES ($1, $2, $3)",
        [name, price, category]
    );

    return { message: "Product created" };
};

exports.searchProducts = async (keyword) => {
    const result = await db.query(
        "SELECT * FROM products WHERE name ILIKE $1",
        [`%${keyword}%`]
    );

    return result.rows;
};