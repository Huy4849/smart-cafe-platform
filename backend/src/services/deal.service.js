const dealRepository = require('../repositories/deal.repository');

class DealService {
    async getAllDeals() {
        return await dealRepository.findAll();
    }

    async createDeal(data) {
        return await dealRepository.create(data);
    }

    async updateDealStage(id, stage) {
        return await dealRepository.updateStage(id, stage);
    }

    async updateDeal(id, data) {
        return await dealRepository.update(id, data);
    }

    async deleteDeal(id) {
        return await dealRepository.remove(id);
    }
}

module.exports = new DealService();
