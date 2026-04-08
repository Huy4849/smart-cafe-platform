const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.get('/', leadController.getLeads);
router.post('/', leadController.createLead);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;
