import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@newadv.local';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@12345';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN, isActive: true },
      });
    }
    console.log(`Admin exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
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

  console.log(`Admin created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

