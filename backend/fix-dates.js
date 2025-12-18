const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update all events to have dates in 2026 (future dates)
  const events = await prisma.event.findMany();

  for (const event of events) {
    const oldDate = new Date(event.date);
    const oldEndDate = event.endDate ? new Date(event.endDate) : null;

    // Add 1 year to move to 2026
    const newDate = new Date(oldDate);
    newDate.setFullYear(newDate.getFullYear() + 1);

    const newEndDate = oldEndDate ? new Date(oldEndDate) : null;
    if (newEndDate) {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    await prisma.event.update({
      where: { id: event.id },
      data: {
        date: newDate,
        endDate: newEndDate,
        title: event.title.replace('2025', '2026'),
      },
    });

    console.log(`Updated: ${event.title} -> ${newDate.toISOString()}`);
  }

  console.log('\nAll events updated to 2026!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
