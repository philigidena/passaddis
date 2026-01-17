const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://passaddis_admin:Atsed2025%23@passaddis-dev-postgres.ctm4gw4ymzq7.eu-north-1.rds.amazonaws.com:5432/passaddis?schema=public'
    }
  }
});

async function main() {
  const email = 'filmongidena@gmail.com';
  const password = 'PassAddis2026!';
  const name = 'Filmon Gidena';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('User already exists:', existingUser.email, 'Role:', existingUser.role);

    // Update to admin if not already
    if (existingUser.role !== 'ADMIN') {
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'ADMIN' }
      });
      console.log('Updated role to:', updated.role);
    }
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone: `admin_${Date.now()}`, // Placeholder phone since it's required
      isVerified: true,
      role: 'ADMIN'
    }
  });

  console.log('Admin user created successfully!');
  console.log('Email:', user.email);
  console.log('Name:', user.name);
  console.log('Role:', user.role);
  console.log('ID:', user.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
