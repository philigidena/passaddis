const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://passaddis_admin:Atsed2025%23@passaddis-dev-postgres.ctm4gw4ymzq7.eu-north-1.rds.amazonaws.com:5432/passaddis?schema=public'
    }
  }
});

async function main() {
  const phone = process.argv[2] || '0982155737';

  // List all users first
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, name: true, role: true }
  });
  console.log('All users:', users);

  const user = await prisma.user.findFirst({
    where: { phone }
  });

  if (!user) {
    console.log('User not found with phone:', phone);
    return;
  }

  console.log('Found user:', user.name, user.phone, 'Current role:', user.role);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' }
  });

  console.log('Updated role to:', updated.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
