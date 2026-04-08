const leadRepository = require('../repositories/lead.repository');

class LeadService {
    async getAllLeads() {
        return await leadRepository.findAll();
    }

    async createLead(data, userId) {
        return await leadRepository.create({ ...data, assignedUserId: userId });
    }

    async deleteLead(id) {
        return await leadRepository.remove(id);
    }

    async updateLead(id, data) {
        return await leadRepository.update(id, data);
    }
}

module.exports = new LeadService();
