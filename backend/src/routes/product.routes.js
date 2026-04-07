const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createProductSchema, getProductsSchema, searchProductsSchema } = require("../validations/product.validation");

// public
router.get("/", validate(getProductsSchema), productController.getProducts);
router.get("/search", validate(searchProductsSchema), productController.searchProducts);

// admin only
router.post("/", auth.protect, auth.restrictTo("admin"), validate(createProductSchema), productController.createProduct);

module.exports = router;