"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
exports.updateMe = updateMe;
const zod_1 = require("zod");
const errorHandler_1 = require("../middleware/errorHandler");
const advocate_service_1 = require("../services/advocate.service");
async function getMe(req, res, next) {
    try {
        if (!req.auth)
            throw new errorHandler_1.HttpError(401, 'Unauthorized');
        const user = await (0, advocate_service_1.getUserSafe)(req.auth.userId);
        return res.json(user);
    }
    catch (e) {
        return next(e);
    }
}
const updateSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().min(5).nullable().optional(),
    barId: zod_1.z.string().min(1).nullable().optional(),
    experienceYears: zod_1.z.coerce.number().int().nonnegative().nullable().optional(),
    practiceAreas: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    city: zod_1.z.string().min(1).nullable().optional(),
    state: zod_1.z.string().min(1).nullable().optional(),
});
async function updateMe(req, res, next) {
    try {
        if (!req.auth)
            throw new errorHandler_1.HttpError(401, 'Unauthorized');
        const input = updateSchema.parse(req.body);
        const updated = await (0, advocate_service_1.updateUserProfile)(req.auth.userId, input);
        return res.json(updated);
    }
    catch (e) {
        return next(e);
    }
}
