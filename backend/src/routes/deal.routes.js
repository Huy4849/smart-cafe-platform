const express = require('express');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.get('/', dealController.getDeals);
router.post('/', dealController.createDeal);
router.put('/:id', dealController.updateDeal);
router.patch('/:id/stage', dealController.updateStage);
router.delete('/:id', dealController.deleteDeal);

module.exports = router;
