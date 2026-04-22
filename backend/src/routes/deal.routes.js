const express = require('express');
const router = express.Router();
const dealController = require('../controllers/deal.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.route('/')
    .get(dealController.getDeals)
    .post(dealController.createDeal);

router.route('/:id')
    .get(dealController.getDeal)
    .put(dealController.updateDeal)
    .delete(dealController.deleteDeal);

router.patch('/:id/stage', dealController.updateDealStage);

module.exports = router;
