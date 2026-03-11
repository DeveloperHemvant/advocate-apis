import { Router } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  adminLogin,
  listAdvocates,
  updateAdvocateStatus,
  getSettings,
  putSettings,
} from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.post('/login', adminLogin);

adminRouter.get('/advocates', requireAuth, requireRole(Role.ADMIN), listAdvocates);
adminRouter.patch(
  '/advocates/:id/status',
  requireAuth,
  requireRole(Role.ADMIN),
  updateAdvocateStatus,
);

adminRouter.get('/settings', requireAuth, requireRole(Role.ADMIN), getSettings);
adminRouter.put('/settings', requireAuth, requireRole(Role.ADMIN), putSettings);

