const redis = require("../config/redis");
const productRepository = require("../repositories/product.repository");

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

    const products = await productRepository.findPaginated(limit, offset);

    // 👉 save cache
    await redis.set(cacheKey, JSON.stringify(products), {
        EX: 60, // cache 60s
    });

    return products;
};

exports.createProduct = async (data) => {
    const newProduct = await productRepository.create(data);
    return { message: "Product created", product: newProduct };
};

exports.searchProducts = async (keyword) => {
    return await productRepository.searchByName(keyword);
};