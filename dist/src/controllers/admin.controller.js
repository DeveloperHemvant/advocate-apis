"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = adminLogin;
exports.listAdvocates = listAdvocates;
exports.updateAdvocateStatus = updateAdvocateStatus;
exports.getSettings = getSettings;
exports.putSettings = putSettings;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_service_1 = require("../services/auth.service");
const admin_service_1 = require("../services/admin.service");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
async function adminLogin(req, res, next) {
    try {
        const input = loginSchema.parse(req.body);
        const result = await (0, auth_service_1.login)(input.email, input.password, client_1.Role.ADMIN);
        return res.json({ ...result, admin: result.user });
    }
    catch (e) {
        return next(e);
    }
}
async function listAdvocates(req, res, next) {
    try {
        const schema = zod_1.z.object({
            status: zod_1.z.nativeEnum(client_1.ProfileStatus).optional(),
            search: zod_1.z.string().min(1).optional(),
            page: zod_1.z.coerce.number().int().positive().default(1),
            pageSize: zod_1.z.coerce.number().int().positive().max(100).default(20),
        });
        const q = schema.parse(req.query);
        const result = await (0, admin_service_1.listAdvocates)(q);
        return res.json(result);
    }
    catch (e) {
        return next(e);
    }
}
async function updateAdvocateStatus(req, res, next) {
    try {
        if (!req.auth)
            throw new errorHandler_1.HttpError(401, 'Unauthorized');
        const schema = zod_1.z.object({ status: zod_1.z.nativeEnum(client_1.ProfileStatus) });
        const input = schema.parse(req.body);
        const advocateId = zod_1.z.string().min(1).parse(req.params.id);
        const updated = await (0, admin_service_1.setAdvocateStatus)({
            actorUserId: req.auth.userId,
            advocateId,
            status: input.status,
        });
        return res.json(updated);
    }
    catch (e) {
        return next(e);
    }
}
async function getSettings(_req, res, next) {
    try {
        const items = await (0, admin_service_1.getAllSettings)();
        return res.json({ items });
    }
    catch (e) {
        return next(e);
    }
}
async function putSettings(req, res, next) {
    try {
        if (!req.auth)
            throw new errorHandler_1.HttpError(401, 'Unauthorized');
        const schema = zod_1.z.object({
            settings: zod_1.z.record(zod_1.z.string().min(1), zod_1.z.string()),
        });
        const input = schema.parse(req.body);
        const updated = await (0, admin_service_1.putAllSettings)({
            actorUserId: req.auth.userId,
            settings: input.settings,
        });
        return res.json({ items: updated });
    }
    catch (e) {
        return next(e);
    }
}
