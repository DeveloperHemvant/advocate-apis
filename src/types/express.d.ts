import type { Role, ProfileStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: Role;
        profileStatus?: ProfileStatus;
      };
    }
  }
}

export {};

