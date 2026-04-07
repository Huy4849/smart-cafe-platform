const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCustomerSchema } = require('../validations/customer.validation');

router.use(auth.protect);

router.get('/', customerController.getCustomers);
router.post('/', validate(createCustomerSchema), customerController.createCustomer);

module.exports = router;
