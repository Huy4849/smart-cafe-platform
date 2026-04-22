const taskRepository = require('../repositories/task.repository');

class TaskService {
    async getAllTasks(filters = {}) {
        return await taskRepository.findAll(filters);
    }

    async createTask(data, userId) {
        return await taskRepository.create({ ...data, assignedUserId: userId });
    }

    async updateTaskStatus(id, status) {
        return await taskRepository.updateStatus(id, status);
    }

    async updateTask(id, data) {
        return await taskRepository.update(id, data);
    }

    async deleteTask(id) {
        return await taskRepository.remove(id);
    }
}

module.exports = new TaskService();
