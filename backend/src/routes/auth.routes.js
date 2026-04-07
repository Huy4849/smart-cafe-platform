const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { loginSchema, registerSchema } = require('../validations/auth.validation');

// Không cần try catch cho express 5 nếu nó native unhandled promise rejection.
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;