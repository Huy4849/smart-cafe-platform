const AppError = require('../utils/AppError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        console.error('ERROR 💥', err);
        // Special diagnostic log for "map" errors
        if (err.message && err.message.includes('map')) {
            console.log('--- DIAGNOSTIC STACK TRACE ---');
            console.log(err.stack);
        }
        res.status(500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi hệ thống nghiêm trọng!'
        });
    }
};

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        // Here we could handle specific DB errors, like unique constraint
        let error = { ...err };
        error.message = err.message;

        if (err.code === '23505') { // Postgres unique violation
            error = new AppError('Dữ liệu này đã tồn tại trong hệ thống', 400);
        }

        sendErrorProd(error, res);
    }
};
