const leadService = require('../services/lead.service');

exports.getLeads = async (req, res, next) => {
    try {
        const data = await leadService.getAllLeads();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.createLead = async (req, res, next) => {
    try {
        const data = await leadService.createLead(req.body, req.user.id);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.deleteLead = async (req, res, next) => {
    try {
        await leadService.deleteLead(req.params.id);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};

exports.updateLead = async (req, res, next) => {
    try {
        const data = await leadService.updateLead(req.params.id, req.body);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
