import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';

const DEFAULT_EMAIL = 'admin@gmail.com';
const DEFAULT_PASSWORD = '12345678';

export async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL || DEFAULT_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.isActive || existing.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { isActive: true, role: Role.ADMIN },
      });
    }
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Admin',
      role: Role.ADMIN,
      isActive: true,
      profileStatus: 'APPROVED',
    },
  });
  // eslint-disable-next-line no-console
  console.log(`App Admin user created: ${email} / ${password}`);
}

