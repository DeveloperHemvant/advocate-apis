import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { HttpError } from '../middleware/errorHandler';
import { login, loginWithPhoneOtp, refresh, registerAdvocate, revoke } from '../services/auth.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  phone: z.string().min(5).optional(),
  barId: z.string().min(1).optional(),
  experienceYears: z.coerce.number().int().nonnegative().optional(),
  practiceAreas: z.array(z.string().min(1)).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
});

export async function advocateRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerAdvocate(input);
    return res.status(201).json(user);
  } catch (e) {
    return next(e);
  }
}

export async function advocateLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z
      .object({
        email: z.string().email().optional(),
        emailOrPhone: z.string().min(1).optional(),
        password: z.string().min(1),
      })
      .refine((d) => Boolean(d.email || d.emailOrPhone), {
        message: 'emailOrPhone is required',
        path: ['emailOrPhone'],
      });
    const input = schema.parse(req.body);
    const identifier = input.emailOrPhone ?? input.email!;
    const result = await login(identifier, input.password, Role.ADVOCATE);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({ refreshToken: z.string().min(1) });
    const input = schema.parse(req.body);
    const result = await refresh(input.refreshToken);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({ refreshToken: z.string().min(1) });
    const input = schema.parse(req.body);
    await revoke(input.refreshToken);
    return res.status(204).send();
  } catch (e) {
    if (e instanceof HttpError) return next(e);
    return next(e);
  }
}

const otpRequestSchema = z.object({
  phone: z.string().min(5),
});

export async function requestOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const input = otpRequestSchema.parse(req.body);
    // For now we always accept; when SMS provider is configured, send real SMS here.
    // eslint-disable-next-line no-console
    console.log(`OTP requested for phone ${input.phone}. Using static OTP 123456 in dev.`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return next(e);
  }
}

const otpVerifySchema = z.object({
  phone: z.string().min(5),
  otp: z.string().min(4),
});

export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const input = otpVerifySchema.parse(req.body);
    const expected = process.env.OTP_STATIC_CODE || '123456';
    if (input.otp !== expected) {
      throw new HttpError(400, 'Invalid OTP');
    }
    const result = await loginWithPhoneOtp(input.phone);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
}

