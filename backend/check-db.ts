import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    select: { id: true, title: true, status: true },
    take: 5
  });
  console.log('Events in database:', events);

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
    take: 3
  });
  console.log('Users in database:', users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
