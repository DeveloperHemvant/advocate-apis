import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function getUserSafe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isActive: true,
      profileStatus: true,
      barId: true,
      experienceYears: true,
      practiceAreas: true,
      city: true,
      state: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

export async function updateUserProfile(
  userId: string,
  input: {
    fullName?: string;
    phone?: string | null;
    barId?: string | null;
    experienceYears?: number | null;
    practiceAreas?: string[];
    city?: string | null;
    state?: string | null;
  },
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      phone: input.phone ?? undefined,
      barId: input.barId ?? undefined,
      experienceYears: input.experienceYears ?? undefined,
      practiceAreas: input.practiceAreas ?? undefined,
      city: input.city ?? undefined,
      state: input.state ?? undefined,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isActive: true,
      profileStatus: true,
      barId: true,
      experienceYears: true,
      practiceAreas: true,
      city: true,
      state: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return updated;
}

