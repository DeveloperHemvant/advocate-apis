"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
exports.errorHandler = errorHandler;
class HttpError extends Error {
    status;
    details;
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}
exports.HttpError = HttpError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            error: err.message,
            details: err.details,
        });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
}
