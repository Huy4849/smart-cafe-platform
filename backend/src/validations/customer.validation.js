const { z } = require('zod');

exports.createCustomerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(255),
        phone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number format")
    })
});
