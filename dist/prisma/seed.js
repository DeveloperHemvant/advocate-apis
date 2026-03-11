"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.env.ADMIN_EMAIL ?? 'admin@newadv.local';
    const password = process.env.ADMIN_PASSWORD ?? 'Admin@12345';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        if (existing.role !== client_1.Role.ADMIN) {
            await prisma.user.update({
                where: { id: existing.id },
                data: { role: client_1.Role.ADMIN, isActive: true },
            });
        }
        console.log(`Admin exists: ${email}`);
        return;
    }
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    await prisma.user.create({
        data: {
            email,
            passwordHash,
            fullName: 'Admin',
            role: client_1.Role.ADMIN,
            isActive: true,
            profileStatus: 'APPROVED',
        },
    });
    console.log(`Admin created: ${email}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
