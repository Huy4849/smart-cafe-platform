const customerService = require('../services/customer.service');

exports.getCustomers = async (req, res, next) => {
    try {
        const data = await customerService.getAllCustomers();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.createCustomer = async (req, res, next) => {
    try {
        const data = await customerService.createCustomer(req.body);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
