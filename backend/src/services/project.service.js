const projectRepository = require('../repositories/project.repository');

class ProjectService {
    async createProject(data, owner_id) {
        return await projectRepository.create({ ...data, owner_id });
    }

    async getProjects(ownerId, role, query = {}) {
        return await projectRepository.findAll(ownerId, role, query);
    }

    async getProjectById(id) {
        return await projectRepository.findById(id);
    }

    async updateProject(id, data) {
        return await projectRepository.update(id, data);
    }

    async deleteProject(id) {
        return await projectRepository.remove(id);
    }
}

module.exports = new ProjectService();
