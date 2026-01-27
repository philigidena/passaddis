import { PrismaClient, EventCategory, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding more events to database...\n');

  // Get the organizer
  const organizer = await prisma.organizer.findFirst({
    where: { isVerified: true },
  });

  if (!organizer) {
    console.log('No verified organizer found. Creating one...');
    // Create a test organizer if needed
    const user = await prisma.user.findFirst({ where: { role: 'ORGANIZER' } });
    if (!user) {
      console.log('No organizer user found. Please run seed-prod.ts first.');
      return;
    }
  }

  const organizerId = organizer!.id;
  console.log('Using organizer:', organizerId);

  // Events to add
  const eventsToAdd = [
    {
      title: 'Ethiopian Premier League - Derby Day',
      description: 'Watch the biggest football rivalry in Ethiopia! St. George FC vs Ethiopia Coffee FC at the historic Addis Ababa Stadium.',
      venue: 'Addis Ababa Stadium',
      address: 'Stadium Area',
      city: 'Addis Ababa',
      date: new Date('2026-02-08T15:00:00'),
      endDate: new Date('2026-02-08T17:30:00'),
      category: EventCategory.SPORTS,
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
      ticketTypes: [
        { name: 'Popolare', description: 'Standing area behind goals', price: 50, quantity: 5000, maxPerOrder: 10 },
        { name: 'Tribuna', description: 'Seated side sections', price: 150, quantity: 3000, maxPerOrder: 8 },
        { name: 'VIP Box', description: 'Premium covered seating', price: 500, quantity: 200, maxPerOrder: 4 },
      ],
    },
    {
      title: 'Addis Fashion Week 2026',
      description: 'Witness the best of Ethiopian fashion with designs from top local and international designers. A celebration of culture and style.',
      venue: 'Sheraton Addis',
      address: 'Taitu Street',
      city: 'Addis Ababa',
      date: new Date('2026-03-15T18:00:00'),
      endDate: new Date('2026-03-17T22:00:00'),
      category: EventCategory.FESTIVAL,
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      ticketTypes: [
        { name: 'Day Pass', description: 'Single day access', price: 800, quantity: 500, maxPerOrder: 4 },
        { name: 'Full Pass', description: 'All 3 days access', price: 2000, quantity: 200, maxPerOrder: 2 },
        { name: 'VIP Experience', description: 'Front row + backstage access', price: 5000, quantity: 50, maxPerOrder: 2 },
      ],
    },
    {
      title: 'Aster Aweke Farewell Tour',
      description: "The Queen of Ethiopian music performs her greatest hits one last time. An emotional evening celebrating decades of musical excellence.",
      venue: 'Hyatt Regency',
      address: 'Meskel Square Area',
      city: 'Addis Ababa',
      date: new Date('2026-04-25T19:00:00'),
      endDate: new Date('2026-04-25T23:00:00'),
      category: EventCategory.MUSIC,
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
      ticketTypes: [
        { name: 'Standard', description: 'General seating', price: 1000, quantity: 800, maxPerOrder: 6 },
        { name: 'Gold', description: 'Premium seating + drink', price: 2500, quantity: 200, maxPerOrder: 4 },
        { name: 'Diamond', description: 'Table seating + dinner', price: 5000, quantity: 50, maxPerOrder: 2 },
      ],
    },
    {
      title: 'Ethiopian Coffee Festival',
      description: "Celebrate Ethiopia's gift to the world! Coffee tastings, barista competitions, and cultural performances.",
      venue: 'Unity Park',
      address: 'National Palace',
      city: 'Addis Ababa',
      date: new Date('2026-03-01T09:00:00'),
      endDate: new Date('2026-03-01T18:00:00'),
      category: EventCategory.FESTIVAL,
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop',
      ticketTypes: [
        { name: 'General Entry', description: 'Festival access', price: 200, quantity: 2000, maxPerOrder: 10 },
        { name: 'Coffee Lover Pass', description: 'Includes tasting kit', price: 500, quantity: 500, maxPerOrder: 4 },
        { name: 'Connoisseur Package', description: 'All tastings + merchandise', price: 1200, quantity: 100, maxPerOrder: 2 },
      ],
    },
    {
      title: 'Addis Run 2026 - 10K Marathon',
      description: 'Join thousands of runners in the annual Addis Run! Experience the beauty of Addis while promoting health and fitness.',
      venue: 'Meskel Square to Entoto',
      address: 'Meskel Square',
      city: 'Addis Ababa',
      date: new Date('2026-05-10T06:00:00'),
      endDate: new Date('2026-05-10T12:00:00'),
      category: EventCategory.SPORTS,
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&h=600&fit=crop',
      ticketTypes: [
        { name: '5K Fun Run', description: 'Family-friendly distance', price: 150, quantity: 3000, maxPerOrder: 5 },
        { name: '10K Race', description: 'Competitive 10K', price: 300, quantity: 2000, maxPerOrder: 3 },
        { name: 'Half Marathon', description: '21K challenge', price: 500, quantity: 500, maxPerOrder: 2 },
      ],
    },
    {
      title: 'Addis Comedy Night',
      description: 'Laugh until you cry with Ethiopia\'s funniest comedians! Featuring Abiy Teka, Filfilu, and special guests.',
      venue: 'Capital Hotel',
      address: 'Bole Road',
      city: 'Addis Ababa',
      date: new Date('2026-02-21T20:00:00'),
      endDate: new Date('2026-02-21T23:00:00'),
      category: EventCategory.COMEDY,
      status: EventStatus.PUBLISHED,
      isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=600&fit=crop',
      ticketTypes: [
        { name: 'Standard', description: 'Regular seating', price: 300, quantity: 400, maxPerOrder: 6 },
        { name: 'Premium', description: 'Front section', price: 600, quantity: 100, maxPerOrder: 4 },
      ],
    },
  ];

  let created = 0;
  for (const eventData of eventsToAdd) {
    // Check if event already exists
    const existing = await prisma.event.findFirst({
      where: { title: eventData.title },
    });

    if (existing) {
      console.log(`⏭️  Skipping "${eventData.title}" - already exists`);
      continue;
    }

    const { ticketTypes, ...eventDetails } = eventData;

    const event = await prisma.event.create({
      data: {
        ...eventDetails,
        organizerId,
        ticketTypes: {
          create: ticketTypes,
        },
      },
    });

    console.log(`✅ Created: ${event.title}`);
    created++;
  }

  console.log(`\n========================================`);
  console.log(`🎉 Added ${created} new events!`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
