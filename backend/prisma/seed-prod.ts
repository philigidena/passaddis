import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...\n');

  // Create a test user with email/password
  const passwordHash = await bcrypt.hash('Test1234!', 10);

  let testUser = await prisma.user.findFirst({
    where: { email: 'test@passaddis.com' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        phone: '0911111111',
        email: 'test@passaddis.com',
        name: 'Test User',
        passwordHash,
        isVerified: true,
        role: 'ORGANIZER',
      },
    });
    console.log('✅ Created test user:', testUser.email);
  } else {
    console.log('ℹ️  Test user exists:', testUser.email);
  }

  // Create organizer profile
  let organizer = await prisma.organizer.findUnique({
    where: { userId: testUser.id },
  });

  if (!organizer) {
    organizer = await prisma.organizer.create({
      data: {
        userId: testUser.id,
        businessName: 'PassAddis Events',
        description: 'Official PassAddis event organizer',
        isVerified: true,
        logo: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop',
      },
    });
    console.log('✅ Created organizer:', organizer.businessName);
  }

  // Create test events
  const existingEvents = await prisma.event.count();
  if (existingEvents === 0) {
    const events = await Promise.all([
      prisma.event.create({
        data: {
          title: 'Addis Jazz Festival 2026',
          description: 'Experience the best of Ethiopian jazz with international artists. A night of soulful music under the stars at the beautiful Ghion Hotel gardens.',
          venue: 'Ghion Hotel',
          address: 'Ras Desta Damtew Street',
          city: 'Addis Ababa',
          date: new Date('2026-01-25T19:00:00'),
          endDate: new Date('2026-01-25T23:00:00'),
          category: 'MUSIC',
          status: 'PUBLISHED',
          isFeatured: true,
          imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'General Admission', description: 'Standard entry', price: 500, quantity: 200, maxPerOrder: 5 },
              { name: 'VIP', description: 'Front row seats + drinks', price: 1500, quantity: 50, maxPerOrder: 2 },
              { name: 'VVIP', description: 'Private table + full service', price: 3000, quantity: 20, maxPerOrder: 2 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Ethiopian Comedy Night',
          description: 'Laugh out loud with Ethiopia\'s funniest comedians. Featuring Abiy Teka, Filfilu, and more!',
          venue: 'Millennium Hall',
          address: 'Bole Road',
          city: 'Addis Ababa',
          date: new Date('2026-01-18T20:00:00'),
          endDate: new Date('2026-01-18T23:00:00'),
          category: 'COMEDY',
          status: 'PUBLISHED',
          isFeatured: false,
          imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'Standard', description: 'Regular seating', price: 300, quantity: 500, maxPerOrder: 10 },
              { name: 'Premium', description: 'Best view seats', price: 600, quantity: 100, maxPerOrder: 4 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Teddy Afro Live Concert',
          description: 'The legendary Teddy Afro returns for an unforgettable night of music. Don\'t miss this historic event!',
          venue: 'National Stadium',
          address: 'Stadium Road',
          city: 'Addis Ababa',
          date: new Date('2026-02-14T18:00:00'),
          endDate: new Date('2026-02-14T23:00:00'),
          category: 'MUSIC',
          status: 'PUBLISHED',
          isFeatured: true,
          imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'Standing', description: 'General admission standing', price: 400, quantity: 5000, maxPerOrder: 10 },
              { name: 'Seated', description: 'Reserved seating', price: 800, quantity: 2000, maxPerOrder: 6 },
              { name: 'VIP Lounge', description: 'Exclusive lounge access', price: 2500, quantity: 200, maxPerOrder: 4 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Tech Conference Ethiopia',
          description: 'Connect with tech leaders and entrepreneurs. Learn about the latest innovations and network with industry experts.',
          venue: 'Skylight Hotel',
          address: 'Bole Road',
          city: 'Addis Ababa',
          date: new Date('2026-02-20T09:00:00'),
          endDate: new Date('2026-02-20T17:00:00'),
          category: 'CONFERENCE',
          status: 'PUBLISHED',
          isFeatured: false,
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'Standard Pass', description: 'Full day access', price: 1000, quantity: 300, maxPerOrder: 5 },
              { name: 'Premium Pass', description: 'Includes workshop + lunch', price: 2000, quantity: 100, maxPerOrder: 3 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Meskel Square Festival',
          description: 'Celebrate the annual Meskel Festival with traditional music, dance, and the lighting of the Demera bonfire.',
          venue: 'Meskel Square',
          address: 'Meskel Square',
          city: 'Addis Ababa',
          date: new Date('2026-09-27T16:00:00'),
          endDate: new Date('2026-09-27T22:00:00'),
          category: 'FESTIVAL',
          status: 'PUBLISHED',
          isFeatured: true,
          imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'Free Entry', description: 'General admission', price: 0, quantity: 10000, maxPerOrder: 10 },
              { name: 'VIP Viewing', description: 'Reserved viewing area', price: 500, quantity: 500, maxPerOrder: 5 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Ethiopian Premier League - Derby Day',
          description: 'Watch the biggest football rivalry in Ethiopia! St. George FC vs Ethiopia Coffee FC at the historic Addis Ababa Stadium.',
          venue: 'Addis Ababa Stadium',
          address: 'Stadium Area',
          city: 'Addis Ababa',
          date: new Date('2026-02-08T15:00:00'),
          endDate: new Date('2026-02-08T17:30:00'),
          category: 'SPORTS',
          status: 'PUBLISHED',
          isFeatured: true,
          imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'Popolare', description: 'Standing area behind goals', price: 50, quantity: 5000, maxPerOrder: 10 },
              { name: 'Tribuna', description: 'Seated side sections', price: 150, quantity: 3000, maxPerOrder: 8 },
              { name: 'VIP Box', description: 'Premium covered seating', price: 500, quantity: 200, maxPerOrder: 4 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Addis Fashion Week 2026',
          description: 'Witness the best of Ethiopian fashion with designs from top local and international designers. A celebration of culture and style.',
          venue: 'Sheraton Addis',
          address: 'Taitu Street',
          city: 'Addis Ababa',
          date: new Date('2026-03-15T18:00:00'),
          endDate: new Date('2026-03-17T22:00:00'),
          category: 'FESTIVAL',
          status: 'PUBLISHED',
          isFeatured: true,
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'Day Pass', description: 'Single day access', price: 800, quantity: 500, maxPerOrder: 4 },
              { name: 'Full Pass', description: 'All 3 days access', price: 2000, quantity: 200, maxPerOrder: 2 },
              { name: 'VIP Experience', description: 'Front row + backstage access', price: 5000, quantity: 50, maxPerOrder: 2 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Aster Aweke Farewell Tour',
          description: 'The Queen of Ethiopian music performs her greatest hits one last time. An emotional evening celebrating decades of musical excellence.',
          venue: 'Hyatt Regency',
          address: 'Meskel Square Area',
          city: 'Addis Ababa',
          date: new Date('2026-04-25T19:00:00'),
          endDate: new Date('2026-04-25T23:00:00'),
          category: 'MUSIC',
          status: 'PUBLISHED',
          isFeatured: true,
          imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'Standard', description: 'General seating', price: 1000, quantity: 800, maxPerOrder: 6 },
              { name: 'Gold', description: 'Premium seating + drink', price: 2500, quantity: 200, maxPerOrder: 4 },
              { name: 'Diamond', description: 'Table seating + dinner', price: 5000, quantity: 50, maxPerOrder: 2 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Ethiopian Coffee Festival',
          description: 'Celebrate Ethiopia\'s gift to the world! Coffee tastings, barista competitions, and cultural performances.',
          venue: 'Unity Park',
          address: 'National Palace',
          city: 'Addis Ababa',
          date: new Date('2026-03-01T09:00:00'),
          endDate: new Date('2026-03-01T18:00:00'),
          category: 'FESTIVAL',
          status: 'PUBLISHED',
          isFeatured: true,
          imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: 'General Entry', description: 'Festival access', price: 200, quantity: 2000, maxPerOrder: 10 },
              { name: 'Coffee Lover Pass', description: 'Includes tasting kit', price: 500, quantity: 500, maxPerOrder: 4 },
              { name: 'Connoisseur Package', description: 'All tastings + merchandise', price: 1200, quantity: 100, maxPerOrder: 2 },
            ],
          },
        },
      }),
      prisma.event.create({
        data: {
          title: 'Addis Run 2026 - 10K Marathon',
          description: 'Join thousands of runners in the annual Addis Run! Experience the beauty of Addis while promoting health and fitness.',
          venue: 'Meskel Square to Entoto',
          address: 'Meskel Square',
          city: 'Addis Ababa',
          date: new Date('2026-05-10T06:00:00'),
          endDate: new Date('2026-05-10T12:00:00'),
          category: 'SPORTS',
          status: 'PUBLISHED',
          isFeatured: false,
          imageUrl: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&h=600&fit=crop',
          organizerId: organizer.id,
          ticketTypes: {
            create: [
              { name: '5K Fun Run', description: 'Family-friendly distance', price: 150, quantity: 3000, maxPerOrder: 5 },
              { name: '10K Race', description: 'Competitive 10K', price: 300, quantity: 2000, maxPerOrder: 3 },
              { name: 'Half Marathon', description: '21K challenge', price: 500, quantity: 500, maxPerOrder: 2 },
            ],
          },
        },
      }),
    ]);
    console.log(`✅ Created ${events.length} events`);
  }

  // Create pickup locations
  const existingLocations = await prisma.pickupLocation.count();
  if (existingLocations === 0) {
    await prisma.pickupLocation.createMany({
      data: [
        { name: 'Shoa Supermarket', area: 'Bole', address: 'Bole Road, near Edna Mall', hours: '8 AM - 10 PM' },
        { name: 'Safeway Supermarket', area: 'Sarbet', address: 'Sarbet, Lideta', hours: '7 AM - 9 PM' },
        { name: 'Fantu Supermarket', area: 'Kazanchis', address: 'Kazanchis, near Intercontinental', hours: '8 AM - 9 PM' },
        { name: 'Queens Supermarket', area: 'CMC', address: 'CMC Road, Michael', hours: '8 AM - 10 PM' },
      ],
    });
    console.log('✅ Created pickup locations');
  }

  // Create shop items
  const existingItems = await prisma.shopItem.count();
  if (existingItems === 0) {
    await prisma.shopItem.createMany({
      data: [
        { name: 'Ambo Water Pack (6)', description: 'Pack of 6 Ambo mineral water bottles', price: 180, category: 'WATER', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop' },
        { name: 'Highland Water Pack (12)', description: 'Pack of 12 Highland purified water', price: 150, category: 'WATER', imageUrl: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400&h=400&fit=crop' },
        { name: 'Coca-Cola Pack (6)', description: '6 cans of ice-cold Coca-Cola', price: 210, category: 'DRINKS', imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=400&fit=crop' },
        { name: 'Red Bull (4 Pack)', description: 'Energy boost for all-night events', price: 400, category: 'DRINKS', imageUrl: 'https://images.unsplash.com/photo-1613217786163-5896419a2574?w=400&h=400&fit=crop' },
        { name: 'Chips Party Pack', description: 'Assorted chips - Lays, Pringles mix', price: 280, category: 'SNACKS', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop' },
        { name: 'Mixed Nuts & Dried Fruits', description: 'Premium healthy snack mix', price: 250, category: 'SNACKS', imageUrl: 'https://images.unsplash.com/photo-1536591375657-fc29be29f3be?w=400&h=400&fit=crop' },
        { name: 'PassAddis Event T-Shirt', description: 'Official PassAddis branded tee', price: 500, category: 'MERCH', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
        { name: 'Glow Sticks Pack (10)', description: 'Light up your concert experience', price: 120, category: 'MERCH', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', inStock: false },
      ],
    });
    console.log('✅ Created shop items');
  }

  console.log('\n========================================');
  console.log('🎉 Database seeded successfully!\n');
  console.log('Test Account:');
  console.log('  Email: test@passaddis.com');
  console.log('  Password: Test1234!');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
