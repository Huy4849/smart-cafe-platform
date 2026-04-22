const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const validateInput = require("../middlewares/validate.middleware");
const { z } = require("zod");
const projectController = require("../controllers/project.controller");

const createProjectSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        description: z.string().optional().nullable(),
        status: z.string().optional().default('active'),
        priority: z.string().optional().default('medium'),
        category: z.string().optional().default('General'),
        start_date: z.string().optional().nullable(),
        end_date: z.string().optional().nullable()
    })
});

const updateProjectSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional().nullable(),
        status: z.string().optional(),
        priority: z.string().optional(),
        category: z.string().optional(),
        start_date: z.string().optional().nullable(),
        end_date: z.string().optional().nullable()
    })
});

router.use(auth.protect);

router.post(
    "/",
    validateInput(createProjectSchema),
    projectController.createProject
);

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);
router.put(
    "/:id",
    validateInput(updateProjectSchema),
    projectController.updateProject
);
router.delete("/:id", projectController.deleteProject);

module.exports = router;
