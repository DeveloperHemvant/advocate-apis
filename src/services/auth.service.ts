import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sha256 } from '../utils/crypto';
import { HttpError } from '../middleware/errorHandler';
import crypto from 'crypto';
import { env } from '../config/env';

function parseDurationMs(input: string): number {
  const m = /^(\d+)(ms|s|m|h|d)$/.exec(input.trim());
  if (!m) throw new Error(`Unsupported duration: ${input}`);
  const n = Number(m[1]);
  const unit = m[2];
  switch (unit) {
    case 'ms':
      return n;
    case 's':
      return n * 1000;
    case 'm':
      return n * 60 * 1000;
    case 'h':
      return n * 60 * 60 * 1000;
    case 'd':
      return n * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported duration: ${input}`);
  }
}

async function issueTokens(user: { id: string; role: Role; profileStatus?: any }) {
  const accessToken = createAccessToken({
    sub: user.id,
    role: user.role,
    profileStatus: user.profileStatus,
  });

  const jti = crypto.randomUUID();
  const refreshToken = createRefreshToken({ sub: user.id, role: user.role, jti });
  const tokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: { id: jti, userId: user.id, tokenHash, expiresAt },
  });

  return { accessToken, refreshToken };
}

export async function registerAdvocate(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  barId?: string;
  experienceYears?: number;
  practiceAreas?: string[];
  city?: string;
  state?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: Role.ADVOCATE,
      barId: input.barId,
      experienceYears: input.experienceYears,
      practiceAreas: input.practiceAreas ?? [],
      city: input.city,
      state: input.state,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      profileStatus: true,
      createdAt: true,
    },
  });

  return user;
}

export async function login(email: string, password: string, role: Role) {
  const identifier = email.trim();
  const user =
    role === Role.ADVOCATE
      ? await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { phone: identifier }],
          },
        })
      : await prisma.user.findUnique({
          where: { email: identifier },
        });

  if (!user) throw new HttpError(401, 'Invalid email or password');
  if (user.role !== role) throw new HttpError(403, 'Invalid account type');
  if (!user.isActive) throw new HttpError(403, 'Account disabled');

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid email or password');

  const tokens = await issueTokens(user);
  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      profileStatus: user.profileStatus,
      barId: user.barId,
      experienceYears: user.experienceYears,
      practiceAreas: user.practiceAreas,
      city: user.city,
      state: user.state,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function refresh(refreshToken: string) {
  const decoded = verifyRefreshToken(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { id: decoded.jti } });

  if (!record) throw new HttpError(401, 'Invalid refresh token');
  if (record.revokedAt) throw new HttpError(401, 'Refresh token revoked');
  if (record.expiresAt.getTime() < Date.now()) throw new HttpError(401, 'Refresh token expired');
  if (record.tokenHash !== sha256(refreshToken)) throw new HttpError(401, 'Invalid refresh token');

  // Rotate refresh token
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user || !user.isActive) throw new HttpError(401, 'Invalid user');

  const tokens = await issueTokens(user);
  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      profileStatus: user.profileStatus,
      barId: user.barId,
      experienceYears: user.experienceYears,
      practiceAreas: user.practiceAreas,
      city: user.city,
      state: user.state,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export async function revoke(refreshToken: string) {
  const decoded = verifyRefreshToken(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { id: decoded.jti } });
  if (!record) return;
  if (record.revokedAt) return;
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });
}

export async function loginWithPhoneOtp(phone: string) {
  const identifier = phone.trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ phone: identifier }, { email: identifier }],
    },
  });

  if (!user) throw new HttpError(404, 'Account not found for this phone');
  if (user.role !== Role.ADVOCATE) throw new HttpError(403, 'Invalid account type');
  if (!user.isActive) throw new HttpError(403, 'Account disabled');

  const tokens = await issueTokens(user);
  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      profileStatus: user.profileStatus,
      barId: user.barId,
      experienceYears: user.experienceYears,
      practiceAreas: user.practiceAreas,
      city: user.city,
      state: user.state,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

