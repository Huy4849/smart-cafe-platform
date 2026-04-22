const express = require('express');
const router = express.Router();
const noteService = require('../services/note.service');
const auth = require('../middlewares/auth.middleware');

router.use(auth.protect);

router.get('/task/:taskId', async (req, res, next) => {
    try {
        const data = await noteService.getNotesByTask(req.params.taskId);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const data = await noteService.addNoteToTask(req.body, req.user.id);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
