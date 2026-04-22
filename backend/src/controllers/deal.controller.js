const dealRepository = require('../repositories/deal.repository');
const projectService = require('../services/project.service');

exports.getDeals = async (req, res, next) => {
    try {
        const deals = await dealRepository.findAll(req.query);
        res.status(200).json({ status: 'success', data: { deals } });
    } catch (err) {
        next(err);
    }
};

exports.getDeal = async (req, res, next) => {
    try {
        const deal = await dealRepository.findById(req.params.id);
        if (!deal) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy thương vụ' });
        res.status(200).json({ status: 'success', data: { deal } });
    } catch (err) {
        next(err);
    }
};

exports.createDeal = async (req, res, next) => {
    try {
        const deal = await dealRepository.create({ 
            ...req.body, 
            ownerId: req.body.ownerId || req.user.id 
        });
        res.status(201).json({ status: 'success', data: { deal } });
    } catch (err) {
        next(err);
    }
};

exports.updateDeal = async (req, res, next) => {
    try {
        const deal = await dealRepository.update(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { deal } });
    } catch (err) {
        next(err);
    }
};

exports.updateDealStage = async (req, res, next) => {
    try {
        const { stage } = req.body;
        const deal = await dealRepository.updateStage(req.params.id, stage);
        
        // Automation: Create project if Won
        if (stage === 'Won') {
            await projectService.createProject({
                name: `Dự án: ${deal.title}`,
                budget: deal.value,
                dealId: deal.id,
                status: 'planned'
            }, deal.owner_id);
        }

        res.status(200).json({ status: 'success', data: { deal } });
    } catch (err) {
        next(err);
    }
};

exports.deleteDeal = async (req, res, next) => {
    try {
        await dealRepository.remove(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        next(err);
    }
};
