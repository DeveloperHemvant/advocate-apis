import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { ProfileStatus, Role } from '@prisma/client';

export type AccessTokenPayload = {
  sub: string;
  role: Role;
  profileStatus?: ProfileStatus;
};

export type RefreshTokenPayload = {
  sub: string;
  role: Role;
  jti: string;
};

export function createAccessToken(payload: AccessTokenPayload): string {
  const opts: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    ...opts,
  });
}

export function createRefreshToken(payload: RefreshTokenPayload): string {
  const opts: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  };
  // jti is carried inside the payload; do not also set jwtid option
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  if (!decoded.jti) {
    throw new Error('Missing jti');
  }
  return decoded;
}

