const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.route('/')
    .get(leadController.getLeads)
    .post(leadController.createLead);

router.route('/:id')
    .get(leadController.getLead)
    .put(leadController.updateLead)
    .delete(leadController.deleteLead);

module.exports = router;
