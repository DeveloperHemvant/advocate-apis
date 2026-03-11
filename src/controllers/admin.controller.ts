import type { NextFunction, Request, Response } from 'express';
import { ProfileStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler';
import { login } from '../services/auth.service';
import {
  getAllSettings,
  listAdvocates as listAdvocatesSvc,
  putAllSettings,
  setAdvocateStatus,
} from '../services/admin.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await login(input.email, input.password, Role.ADMIN);
    return res.json({ ...result, admin: result.user });
  } catch (e) {
    return next(e);
  }
}

export async function listAdvocates(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      status: z.nativeEnum(ProfileStatus).optional(),
      search: z.string().min(1).optional(),
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().positive().max(100).default(20),
    });
    const q = schema.parse(req.query);
    const result = await listAdvocatesSvc(q);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

export async function updateAdvocateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) throw new HttpError(401, 'Unauthorized');
    const schema = z.object({ status: z.nativeEnum(ProfileStatus) });
    const input = schema.parse(req.body);
    const advocateId = z.string().min(1).parse(req.params.id);
    const updated = await setAdvocateStatus({
      actorUserId: req.auth.userId,
      advocateId,
      status: input.status,
    });
    return res.json(updated);
  } catch (e) {
    return next(e);
  }
}

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await getAllSettings();
    return res.json({ items });
  } catch (e) {
    return next(e);
  }
}

export async function putSettings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) throw new HttpError(401, 'Unauthorized');
    const schema = z.object({
      settings: z.record(z.string().min(1), z.string()),
    });
    const input = schema.parse(req.body);
    const updated = await putAllSettings({
      actorUserId: req.auth.userId,
      settings: input.settings,
    });
    return res.json({ items: updated });
  } catch (e) {
    return next(e);
  }
}

