const { z } = require('zod');

exports.createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(255),
        price: z.number().positive("Price must be greater than 0"),
        category: z.string().min(2, "Category is required")
    })
});

exports.getProductsSchema = z.object({
    query: z.object({
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
    }).optional()
});

exports.searchProductsSchema = z.object({
    query: z.object({
        keyword: z.string().min(1, "Keyword is required")
    })
});
