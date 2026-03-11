"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = require("./routes/auth.routes");
const advocate_routes_1 = require("./routes/advocate.routes");
const admin_routes_1 = require("./routes/admin.routes");
const openapi_1 = require("./docs/openapi");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '1mb' }));
const corsOrigins = (0, env_1.getCorsOrigins)();
app.use((0, cors_1.default)({
    origin: corsOrigins === '*' ? true : corsOrigins,
    credentials: true,
}));
app.get('/health', (_req, res) => res.json({ ok: true }));
// Swagger UI (API docs) - multiple aliases for convenience
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiSpec));
app.use('/swagger', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiSpec));
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapi_1.openApiSpec));
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/advocates', advocate_routes_1.advocateRouter);
app.use('/api/admin', admin_routes_1.adminRouter);
app.use(errorHandler_1.errorHandler);
app.listen(env_1.env.PORT, () => {
    console.log(`API listening on http://localhost:${env_1.env.PORT}`);
    console.log(`Swagger docs available at http://localhost:${env_1.env.PORT}/docs`);
});
