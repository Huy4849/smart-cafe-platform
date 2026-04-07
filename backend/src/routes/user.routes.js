const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

// API cần login mới gọi được
router.get("/profile", auth.protect, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        }
    });
});

module.exports = router;