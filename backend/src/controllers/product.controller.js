const productService = require("../services/product.service");

exports.getProducts = async (req, res) => {
    const { page, limit } = req.query;

    const data = await productService.getProducts(
        Number(page) || 1,
        Number(limit) || 5
    );

    res.json(data);
};

exports.createProduct = async (req, res) => {
    const data = await productService.createProduct(req.body);
    res.json(data);
};

exports.searchProducts = async (req, res) => {
    const { keyword } = req.query;

    const data = await productService.searchProducts(keyword);

    res.json(data);
};