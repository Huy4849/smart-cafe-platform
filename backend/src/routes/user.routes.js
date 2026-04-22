const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

// Lấy thông tin cá nhân hiện tại
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

// Cập nhật thông tin cá nhân
router.put("/profile", auth.protect, userController.updateProfile);

// Đổi mật khẩu
router.post("/change-password", auth.protect, userController.changePassword);

// Lấy danh sách tất cả người dùng
router.get("/", auth.protect, userController.getUsers);

module.exports = router;