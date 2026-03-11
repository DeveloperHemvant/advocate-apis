import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { getCorsOrigins, env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { advocateRouter } from './routes/advocate.routes';
import { adminRouter } from './routes/admin.routes';
import { openApiSpec } from './docs/openapi';
import { ensureDefaultAdmin } from './services/adminSeed';

const app = express();

app.use(express.json({ limit: '1mb' }));

const corsOrigins = getCorsOrigins();
app.use(
  cors({
    origin: corsOrigins === '*' ? true : corsOrigins,
    credentials: true,
  }),
);

app.get('/health', (_req, res) => res.json({ ok: true }));

// Swagger UI (API docs) - multiple aliases for convenience
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api/auth', authRouter);
app.use('/api/advocates', advocateRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

async function start() {
  await ensureDefaultAdmin();
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
    console.log(`Swagger docs available at http://localhost:${env.PORT}/docs`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend', err);
  process.exit(1);
});

