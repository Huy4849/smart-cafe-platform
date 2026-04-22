// LEGACY FILE - This file is no longer used in ProjectFlow
// It was part of the original CRM system and can be safely deleted
// ProjectFlow focuses on project management, not lead management

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
