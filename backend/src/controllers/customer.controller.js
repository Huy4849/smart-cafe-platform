const customerRepository = require('../repositories/customer.repository');

exports.getCustomers = async (req, res, next) => {
    try {
        const customers = await customerRepository.findAll(req.query);
        res.status(200).json({ status: 'success', data: { customers } });
    } catch (err) {
        next(err);
    }
};

exports.getCustomer = async (req, res, next) => {
    try {
        const customer = await customerRepository.findById(req.params.id);
        if (!customer) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy hồ sơ khách hàng' });
        res.status(200).json({ status: 'success', data: { customer } });
    } catch (err) {
        next(err);
    }
};

exports.createCustomer = async (req, res, next) => {
    try {
        const customer = await customerRepository.create(req.body);
        res.status(201).json({ status: 'success', data: { customer } });
    } catch (err) {
        next(err);
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {
        const customer = await customerRepository.update(req.params.id, req.body);
        res.status(200).json({ status: 'success', data: { customer } });
    } catch (err) {
        next(err);
    }
};

exports.deleteCustomer = async (req, res, next) => {
    try {
        await customerRepository.remove(req.params.id);
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        next(err);
    }
};
