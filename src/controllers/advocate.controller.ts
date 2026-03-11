import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler';
import { getUserSafe, updateUserProfile } from '../services/advocate.service';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) throw new HttpError(401, 'Unauthorized');
    const user = await getUserSafe(req.auth.userId);
    return res.json(user);
  } catch (e) {
    return next(e);
  }
}

const updateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().min(5).nullable().optional(),
  barId: z.string().min(1).nullable().optional(),
  experienceYears: z.coerce.number().int().nonnegative().nullable().optional(),
  practiceAreas: z.array(z.string().min(1)).optional(),
  city: z.string().min(1).nullable().optional(),
  state: z.string().min(1).nullable().optional(),
});

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) throw new HttpError(401, 'Unauthorized');
    const input = updateSchema.parse(req.body);
    const updated = await updateUserProfile(req.auth.userId, input);
    return res.json(updated);
  } catch (e) {
    return next(e);
  }
}

