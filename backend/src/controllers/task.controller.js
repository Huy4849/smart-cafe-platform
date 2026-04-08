const taskService = require('../services/task.service');

exports.getTasks = async (req, res, next) => {
    try {
        const data = await taskService.getAllTasks();
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.createTask = async (req, res, next) => {
    try {
        const data = await taskService.createTask(req.body, req.user.id);
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const data = await taskService.updateTaskStatus(req.params.id, req.body.status);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    try {
        const data = await taskService.updateTask(req.params.id, req.body);
        res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

exports.deleteTask = async (req, res, next) => {
    try {
        await taskService.deleteTask(req.params.id);
        res.status(200).json({ status: 'success' });
    } catch (err) {
        next(err);
    }
};
