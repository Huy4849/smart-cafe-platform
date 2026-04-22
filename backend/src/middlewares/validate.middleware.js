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
        let errorMessage = error.message;
        if (error.errors && Array.isArray(error.errors)) {
            errorMessage = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        }
        next(new AppError(`Validation Error: ${errorMessage}`, 400));
    }
};

module.exports = validate;
