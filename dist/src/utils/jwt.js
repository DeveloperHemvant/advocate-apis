"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccessToken = createAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function createAccessToken(payload) {
    const opts = {
        expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
        ...opts,
    });
}
function createRefreshToken(payload) {
    const opts = {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
        jwtid: payload.jti,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        ...opts,
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
}
function verifyRefreshToken(token) {
    const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    if (!decoded.jti) {
        throw new Error('Missing jti');
    }
    return decoded;
}
