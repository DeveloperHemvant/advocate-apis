"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.getCorsOrigins = getCorsOrigins;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().min(1).default('30m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().min(1).default('30d'),
    CORS_ORIGINS: zod_1.z.string().min(1).default('*'),
});
exports.env = envSchema.parse(process.env);
function getCorsOrigins() {
    const raw = exports.env.CORS_ORIGINS.trim();
    if (raw === '*')
        return '*';
    return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}
