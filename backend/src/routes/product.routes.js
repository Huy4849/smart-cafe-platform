const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

// public
router.get("/", productController.getProducts);
router.get("/search", productController.searchProducts);

// admin only
router.post("/", auth, role("admin"), productController.createProduct);

module.exports = router;