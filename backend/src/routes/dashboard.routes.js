const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/stats', auth.protect, dashboardController.getStats);
router.get('/', auth.protect, dashboardController.getStats);

module.exports = router;
