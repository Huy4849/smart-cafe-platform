const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.get('/summary', reportController.getReportSummary);
router.get('/system-stats', reportController.getSystemStats);
router.get('/backup', reportController.downloadBackup);

module.exports = router;
