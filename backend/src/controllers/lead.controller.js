const leadRepository = require('../repositories/lead.repository');

exports.getLeads = async (req, res, next) => {
    try {
        const leads = await leadRepository.findAll(req.query);
        res.status(200).json({ status: 'success', data: { leads } });
    } catch (err) {
        next(err);
    }
};

exports.getLead = async (req, res, next) => {
    try {
        const lead = await leadRepository.findById(req.params.id);
        if (!lead) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy khách hàng tiềm năng' });
        res.status(200).json({ status: 'success', data: { lead } });
    } catch (err) {
        next(err);
    }
};

exports.createLead = async (req, res, next) => {
    try {
        const lead = await leadRepository.create(req.body);
        res.status(201).json({ status: 'success', data: { lead } });
    } catch (err) {
        next(err);
    }
};

exports.updateLead = async (req, res, next) => {
    try {
        const lead = await leadRepository.update(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { lead } });
    } catch (err) {
        next(err);
    }
};

exports.deleteLead = async (req, res, next) => {
    try {
        await leadRepository.remove(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        next(err);
    }
};
