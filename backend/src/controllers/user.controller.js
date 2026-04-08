const userService = require('../services/user.service');

exports.updateProfile = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (err) {
        next(err);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await userService.changePassword(req.user.id, currentPassword, newPassword);
        res.status(200).json({
            status: 'success',
            message: result.message
        });
    } catch (err) {
        next(err);
    }
};
