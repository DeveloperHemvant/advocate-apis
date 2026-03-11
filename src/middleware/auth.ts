import type { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { HttpError } from './errorHandler';
import { verifyAccessToken } from '../utils/jwt';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
      profileStatus: payload.profileStatus,
    };
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new HttpError(401, 'Unauthorized'));
    if (!roles.includes(req.auth.role)) return next(new HttpError(403, 'Forbidden'));
    return next();
  };
}

