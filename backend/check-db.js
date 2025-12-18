const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany();
  console.log('Events count:', events.length);
  console.log('Events:', JSON.stringify(events, null, 2));

  const users = await prisma.user.findMany();
  console.log('\nUsers count:', users.length);
  console.log('Users:', JSON.stringify(users.map(u => ({ id: u.id, email: u.email, phone: u.phone })), null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
