"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdvocates = listAdvocates;
exports.setAdvocateStatus = setAdvocateStatus;
exports.getAllSettings = getAllSettings;
exports.putAllSettings = putAllSettings;
const client_1 = require("@prisma/client");
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
async function listAdvocates(input) {
    const where = { role: client_1.Role.ADVOCATE };
    if (input.status)
        where.profileStatus = input.status;
    if (input.search) {
        where.OR = [
            { email: { contains: input.search, mode: 'insensitive' } },
            { fullName: { contains: input.search, mode: 'insensitive' } },
            { phone: { contains: input.search, mode: 'insensitive' } },
            { city: { contains: input.search, mode: 'insensitive' } },
            { state: { contains: input.search, mode: 'insensitive' } },
        ];
    }
    const skip = (input.page - 1) * input.pageSize;
    const take = input.pageSize;
    const [total, items] = await Promise.all([
        prisma_1.prisma.user.count({ where }),
        prisma_1.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
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
        }),
    ]);
    return { items, total, page: input.page, pageSize: input.pageSize };
}
async function setAdvocateStatus(input) {
    const advocate = await prisma_1.prisma.user.findUnique({ where: { id: input.advocateId } });
    if (!advocate || advocate.role !== client_1.Role.ADVOCATE)
        throw new errorHandler_1.HttpError(404, 'Advocate not found');
    const updated = await prisma_1.prisma.user.update({
        where: { id: advocate.id },
        data: { profileStatus: input.status },
        select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            profileStatus: true,
            updatedAt: true,
        },
    });
    await prisma_1.prisma.auditLog.create({
        data: {
            actorUserId: input.actorUserId,
            action: 'ADVOCATE_STATUS_CHANGED',
            meta: { advocateId: advocate.id, status: input.status },
        },
    });
    return updated;
}
async function getAllSettings() {
    const items = await prisma_1.prisma.appSetting.findMany({
        orderBy: { key: 'asc' },
        select: { key: true, value: true, updatedAt: true },
    });
    return items;
}
async function putAllSettings(input) {
    const entries = Object.entries(input.settings);
    if (entries.length === 0)
        return [];
    const updated = await prisma_1.prisma.$transaction(entries.map(([key, value]) => prisma_1.prisma.appSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
        select: { key: true, value: true, updatedAt: true },
    })));
    await prisma_1.prisma.auditLog.create({
        data: {
            actorUserId: input.actorUserId,
            action: 'SETTINGS_UPDATED',
            meta: { keys: entries.map(([k]) => k) },
        },
    });
    return updated;
}
