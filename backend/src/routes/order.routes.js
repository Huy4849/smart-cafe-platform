const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");

// phải login mới đặt hàng
router.post("/", auth.protect, orderController.createOrder);

module.exports = router;