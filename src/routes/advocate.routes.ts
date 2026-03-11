import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import { getMe, updateMe } from '../controllers/advocate.controller';

export const advocateRouter = Router();

advocateRouter.get('/me', requireAuth, requireRole(Role.ADVOCATE, Role.ADMIN), getMe);
advocateRouter.put('/me', requireAuth, requireRole(Role.ADVOCATE, Role.ADMIN), updateMe);

