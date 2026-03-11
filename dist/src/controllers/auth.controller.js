"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advocateRegister = advocateRegister;
exports.advocateLogin = advocateLogin;
exports.refreshToken = refreshToken;
exports.logout = logout;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_service_1 = require("../services/auth.service");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    fullName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(5).optional(),
    barId: zod_1.z.string().min(1).optional(),
    experienceYears: zod_1.z.coerce.number().int().nonnegative().optional(),
    practiceAreas: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    city: zod_1.z.string().min(1).optional(),
    state: zod_1.z.string().min(1).optional(),
});
async function advocateRegister(req, res, next) {
    try {
        const input = registerSchema.parse(req.body);
        const user = await (0, auth_service_1.registerAdvocate)(input);
        return res.status(201).json(user);
    }
    catch (e) {
        return next(e);
    }
}
async function advocateLogin(req, res, next) {
    try {
        const schema = zod_1.z
            .object({
            email: zod_1.z.string().email().optional(),
            emailOrPhone: zod_1.z.string().min(1).optional(),
            password: zod_1.z.string().min(1),
        })
            .refine((d) => Boolean(d.email || d.emailOrPhone), {
            message: 'emailOrPhone is required',
            path: ['emailOrPhone'],
        });
        const input = schema.parse(req.body);
        const identifier = input.emailOrPhone ?? input.email;
        const result = await (0, auth_service_1.login)(identifier, input.password, client_1.Role.ADVOCATE);
        return res.json(result);
    }
    catch (e) {
        return next(e);
    }
}
async function refreshToken(req, res, next) {
    try {
        const schema = zod_1.z.object({ refreshToken: zod_1.z.string().min(1) });
        const input = schema.parse(req.body);
        const result = await (0, auth_service_1.refresh)(input.refreshToken);
        return res.json(result);
    }
    catch (e) {
        return next(e);
    }
}
async function logout(req, res, next) {
    try {
        const schema = zod_1.z.object({ refreshToken: zod_1.z.string().min(1) });
        const input = schema.parse(req.body);
        await (0, auth_service_1.revoke)(input.refreshToken);
        return res.status(204).send();
    }
    catch (e) {
        if (e instanceof errorHandler_1.HttpError)
            return next(e);
        return next(e);
    }
}
