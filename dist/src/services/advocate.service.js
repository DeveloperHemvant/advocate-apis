"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSafe = getUserSafe;
exports.updateUserProfile = updateUserProfile;
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
async function getUserSafe(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            isActive: true,
            profileStatus: true,
            barId: true,
            experienceYears: true,
            practiceAreas: true,
            city: true,
            state: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user)
        throw new errorHandler_1.HttpError(404, 'User not found');
    return user;
}
async function updateUserProfile(userId, input) {
    const updated = await prisma_1.prisma.user.update({
        where: { id: userId },
        data: {
            fullName: input.fullName,
            phone: input.phone ?? undefined,
            barId: input.barId ?? undefined,
            experienceYears: input.experienceYears ?? undefined,
            practiceAreas: input.practiceAreas ?? undefined,
            city: input.city ?? undefined,
            state: input.state ?? undefined,
        },
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            isActive: true,
            profileStatus: true,
            barId: true,
            experienceYears: true,
            practiceAreas: true,
            city: true,
            state: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return updated;
}
