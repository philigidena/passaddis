const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const otp = await prisma.otpCode.findFirst({
    where: { phone: '0982155737' },
    orderBy: { createdAt: 'desc' }
  });
  console.log('OTP:', otp?.code);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
