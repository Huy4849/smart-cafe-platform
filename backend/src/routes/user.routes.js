const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

// API cần login mới gọi được
router.get("/profile", auth, (req, res) => {
    res.json({
        message: "Protected route",
        user: req.user,
    });
});

module.exports = router;