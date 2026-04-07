const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new AppError(`Validation Error: ${errors}`, 400));
    }
};

module.exports = validate;
