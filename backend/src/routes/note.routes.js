const express = require('express');
const router = express.Router();
const noteService = require('../services/note.service');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.get('/:dealId', async (req, res, next) => {
    try {
        const data = await noteService.getNotesByDeal(req.params.dealId);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const data = await noteService.addNoteToDeal(req.body, req.user.id);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
