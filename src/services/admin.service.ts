import { ProfileStatus, Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function listAdvocates(input: {
  status?: ProfileStatus;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const where: any = { role: Role.ADVOCATE };
  if (input.status) where.profileStatus = input.status;
  if (input.search) {
    where.OR = [
      { email: { contains: input.search, mode: 'insensitive' } },
      { fullName: { contains: input.search, mode: 'insensitive' } },
      { phone: { contains: input.search, mode: 'insensitive' } },
      { city: { contains: input.search, mode: 'insensitive' } },
      { state: { contains: input.search, mode: 'insensitive' } },
    ];
  }

  const skip = (input.page - 1) * input.pageSize;
  const take = input.pageSize;

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
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
    }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function setAdvocateStatus(input: {
  actorUserId: string;
  advocateId: string;
  status: ProfileStatus;
}) {
  const advocate = await prisma.user.findUnique({ where: { id: input.advocateId } });
  if (!advocate || advocate.role !== Role.ADVOCATE) throw new HttpError(404, 'Advocate not found');

  const updated = await prisma.user.update({
    where: { id: advocate.id },
    data: { profileStatus: input.status },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      profileStatus: true,
      updatedAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: 'ADVOCATE_STATUS_CHANGED',
      meta: { advocateId: advocate.id, status: input.status },
    },
  });

  return updated;
}

export async function getAllSettings() {
  const items = await prisma.appSetting.findMany({
    orderBy: { key: 'asc' },
    select: { key: true, value: true, updatedAt: true },
  });
  return items;
}

export async function putAllSettings(input: {
  actorUserId: string;
  settings: Record<string, string>;
}) {
  const entries = Object.entries(input.settings);
  if (entries.length === 0) return [];

  const updated = await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.appSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
        select: { key: true, value: true, updatedAt: true },
      }),
    ),
  );

  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: 'SETTINGS_UPDATED',
      meta: { keys: entries.map(([k]) => k) },
    },
  });

  return updated;
}

