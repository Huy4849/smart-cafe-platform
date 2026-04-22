const projectService = require("../services/project.service");

exports.createProject = async (req, res, next) => {
    try {
        const project = await projectService.createProject(req.body, req.user.id);
        res.status(201).json({ status: "success", data: project });
    } catch (error) {
        next(error);
    }
};

exports.getProjects = async (req, res, next) => {
    try {
        const { search, status } = req.query;
        const projects = await projectService.getProjects(req.user.id, req.user.role, { search, status });
        res.status(200).json({ status: "success", data: { projects } });
    } catch (error) {
        next(error);
    }
};

exports.getProjectById = async (req, res, next) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        res.status(200).json({ status: "success", data: { project } });
    } catch (error) {
        next(error);
    }
};

exports.updateProject = async (req, res, next) => {
    try {
        const project = await projectService.updateProject(req.params.id, req.body);
        res.status(200).json({ status: "success", data: project });
    } catch (error) {
        next(error);
    }
};

exports.deleteProject = async (req, res, next) => {
    try {
        await projectService.deleteProject(req.params.id);
        res.status(200).json({ status: "success", message: "Project deleted successfully" });
    } catch (error) {
        next(error);
    }
};
