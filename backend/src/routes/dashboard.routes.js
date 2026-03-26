const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

// chỉ admin mới xem dashboard
router.get("/", auth, role("admin"), dashboardController.getStats);

module.exports = router;