"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdvocate = registerAdvocate;
exports.login = login;
exports.refresh = refresh;
exports.revoke = revoke;
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const crypto_1 = require("../utils/crypto");
const errorHandler_1 = require("../middleware/errorHandler");
const crypto_2 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
function parseDurationMs(input) {
    const m = /^(\d+)(ms|s|m|h|d)$/.exec(input.trim());
    if (!m)
        throw new Error(`Unsupported duration: ${input}`);
    const n = Number(m[1]);
    const unit = m[2];
    switch (unit) {
        case 'ms':
            return n;
        case 's':
            return n * 1000;
        case 'm':
            return n * 60 * 1000;
        case 'h':
            return n * 60 * 60 * 1000;
        case 'd':
            return n * 24 * 60 * 60 * 1000;
        default:
            throw new Error(`Unsupported duration: ${input}`);
    }
}
async function issueTokens(user) {
    const accessToken = (0, jwt_1.createAccessToken)({
        sub: user.id,
        role: user.role,
        profileStatus: user.profileStatus,
    });
    const jti = crypto_2.default.randomUUID();
    const refreshToken = (0, jwt_1.createRefreshToken)({ sub: user.id, role: user.role, jti });
    const tokenHash = (0, crypto_1.sha256)(refreshToken);
    const expiresAt = new Date(Date.now() + parseDurationMs(env_1.env.JWT_REFRESH_EXPIRES_IN));
    await prisma_1.prisma.refreshToken.create({
        data: { id: jti, userId: user.id, tokenHash, expiresAt },
    });
    return { accessToken, refreshToken };
}
async function registerAdvocate(input) {
    const existing = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing)
        throw new errorHandler_1.HttpError(409, 'Email already registered');
    const passwordHash = await (0, password_1.hashPassword)(input.password);
    const user = await prisma_1.prisma.user.create({
        data: {
            email: input.email,
            passwordHash,
            fullName: input.fullName,
            phone: input.phone,
            role: client_1.Role.ADVOCATE,
            barId: input.barId,
            experienceYears: input.experienceYears,
            practiceAreas: input.practiceAreas ?? [],
            city: input.city,
            state: input.state,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            profileStatus: true,
            createdAt: true,
        },
    });
    return user;
}
async function login(email, password, role) {
    const identifier = email.trim();
    const user = role === client_1.Role.ADVOCATE
        ? await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { phone: identifier }],
            },
        })
        : await prisma_1.prisma.user.findUnique({
            where: { email: identifier },
        });
    if (!user)
        throw new errorHandler_1.HttpError(401, 'Invalid email or password');
    if (user.role !== role)
        throw new errorHandler_1.HttpError(403, 'Invalid account type');
    if (!user.isActive)
        throw new errorHandler_1.HttpError(403, 'Account disabled');
    const ok = await (0, password_1.verifyPassword)(password, user.passwordHash);
    if (!ok)
        throw new errorHandler_1.HttpError(401, 'Invalid email or password');
    const tokens = await issueTokens(user);
    return {
        ...tokens,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            profileStatus: user.profileStatus,
            barId: user.barId,
            experienceYears: user.experienceYears,
            practiceAreas: user.practiceAreas,
            city: user.city,
            state: user.state,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
}
async function refresh(refreshToken) {
    const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const record = await prisma_1.prisma.refreshToken.findUnique({ where: { id: decoded.jti } });
    if (!record)
        throw new errorHandler_1.HttpError(401, 'Invalid refresh token');
    if (record.revokedAt)
        throw new errorHandler_1.HttpError(401, 'Refresh token revoked');
    if (record.expiresAt.getTime() < Date.now())
        throw new errorHandler_1.HttpError(401, 'Refresh token expired');
    if (record.tokenHash !== (0, crypto_1.sha256)(refreshToken))
        throw new errorHandler_1.HttpError(401, 'Invalid refresh token');
    // Rotate refresh token
    await prisma_1.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
    });
    const user = await prisma_1.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user || !user.isActive)
        throw new errorHandler_1.HttpError(401, 'Invalid user');
    const tokens = await issueTokens(user);
    return {
        ...tokens,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            profileStatus: user.profileStatus,
            barId: user.barId,
            experienceYears: user.experienceYears,
            practiceAreas: user.practiceAreas,
            city: user.city,
            state: user.state,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
    };
}
async function revoke(refreshToken) {
    const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
    const record = await prisma_1.prisma.refreshToken.findUnique({ where: { id: decoded.jti } });
    if (!record)
        return;
    if (record.revokedAt)
        return;
    await prisma_1.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
    });
}
