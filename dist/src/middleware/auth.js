"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const errorHandler_1 = require("./errorHandler");
const jwt_1 = require("../utils/jwt");
function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return next(new errorHandler_1.HttpError(401, 'Missing Authorization header'));
    }
    const token = header.slice('Bearer '.length).trim();
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.auth = {
            userId: payload.sub,
            role: payload.role,
            profileStatus: payload.profileStatus,
        };
        return next();
    }
    catch {
        return next(new errorHandler_1.HttpError(401, 'Invalid or expired token'));
    }
}
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.auth)
            return next(new errorHandler_1.HttpError(401, 'Unauthorized'));
        if (!roles.includes(req.auth.role))
            return next(new errorHandler_1.HttpError(403, 'Forbidden'));
        return next();
    };
}
