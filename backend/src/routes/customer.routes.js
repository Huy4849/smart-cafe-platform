const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.route('/')
    .get(customerController.getCustomers)
    .post(customerController.createCustomer);

router.route('/:id')
    .get(customerController.getCustomer)
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

module.exports = router;
