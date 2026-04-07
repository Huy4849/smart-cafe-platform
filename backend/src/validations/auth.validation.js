const { z } = require('zod');

exports.registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(255),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters")
    })
});

exports.loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
});
