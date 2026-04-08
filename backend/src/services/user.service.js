const userRepository = require('../repositories/user.repository');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

class UserService {
    async updateProfile(id, data) {
        return await userRepository.update(id, data);
    }

    async changePassword(id, currentPassword, newPassword) {
        const user = await userRepository.findById(id);
        if (!user) throw new AppError('Không tìm thấy người dùng!', 404);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw new AppError('Mật khẩu hiện tại không chính xác!', 400);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRepository.updatePassword(id, hashedPassword);
        return { message: 'Đổi mật khẩu thành công!' };
    }
}

module.exports = new UserService();
