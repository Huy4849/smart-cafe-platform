const dealService = require('../services/deal.service');

exports.getDeals = async (req, res, next) => {
    try {
        const data = await dealService.getAllDeals();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.createDeal = async (req, res, next) => {
    try {
        const data = await dealService.createDeal(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.updateStage = async (req, res, next) => {
    try {
        const data = await dealService.updateDealStage(req.params.id, req.body.stage);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.updateDeal = async (req, res, next) => {
    try {
        const data = await dealService.updateDeal(req.params.id, req.body);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.deleteDeal = async (req, res, next) => {
    try {
        await dealService.deleteDeal(req.params.id);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};
