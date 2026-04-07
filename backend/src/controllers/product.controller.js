const productService = require("../services/product.service");

exports.getProducts = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const data = await productService.getProducts(Number(page) || 1, Number(limit) || 5);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const data = await productService.createProduct(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.searchProducts = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        const data = await productService.searchProducts(keyword);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};