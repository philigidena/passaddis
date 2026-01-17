"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const user = await prisma.user.findFirst({
        where: { phone: '0982155737' },
    });
    if (!user) {
        console.log('No test user found. Please login first via OTP.');
        return;
    }
    console.log('Found user:', user.id);
    await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ORGANIZER' },
    });
    let organizer = await prisma.organizer.findUnique({
        where: { userId: user.id },
    });
    if (!organizer) {
        organizer = await prisma.organizer.create({
            data: {
                userId: user.id,
                businessName: 'Test Organizer',
                description: 'Test organizer for PassAddis',
                isVerified: true,
            },
        });
        console.log('Created organizer:', organizer.id);
    }
    else {
        console.log('Organizer exists:', organizer.id);
    }
    let event = await prisma.event.findFirst({
        where: { organizerId: organizer.id },
    });
    if (!event) {
        event = await prisma.event.create({
            data: {
                title: 'PassAddis Test Concert',
                description: 'A test concert event for payment testing',
                venue: 'Millennium Hall',
                address: 'Bole, Addis Ababa',
                city: 'Addis Ababa',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                category: 'MUSIC',
                status: 'PUBLISHED',
                isFeatured: true,
                organizerId: organizer.id,
                ticketTypes: {
                    create: [
                        {
                            name: 'General Admission',
                            description: 'Standard entry ticket',
                            price: 500,
                            quantity: 100,
                            maxPerOrder: 5,
                        },
                        {
                            name: 'VIP',
                            description: 'VIP access with premium seating',
                            price: 1500,
                            quantity: 50,
                            maxPerOrder: 2,
                        },
                    ],
                },
            },
        });
        console.log('Created event:', event.id);
        const ticketTypes = await prisma.ticketType.findMany({
            where: { eventId: event.id },
        });
        console.log('Ticket types:', ticketTypes.map((t) => ({ id: t.id, name: t.name, price: t.price })));
    }
    else {
        console.log('Event exists:', event.id);
    }
    let pickupLocation = await prisma.pickupLocation.findFirst();
    if (!pickupLocation) {
        pickupLocation = await prisma.pickupLocation.create({
            data: {
                name: 'Shoa Supermarket - Bole',
                area: 'Bole',
                address: 'Bole Road, near Edna Mall',
                hours: '8:00 AM - 10:00 PM',
                isActive: true,
            },
        });
        console.log('Created pickup location:', pickupLocation.id);
    }
    const shopItems = await prisma.shopItem.findMany();
    if (shopItems.length === 0) {
        await prisma.shopItem.createMany({
            data: [
                { name: 'Water (500ml)', description: 'Bottled water', price: 25, category: 'WATER' },
                { name: 'Water (1L)', description: 'Large bottled water', price: 40, category: 'WATER' },
                { name: 'Coca-Cola', description: '330ml can', price: 35, category: 'DRINKS' },
                { name: 'Red Bull', description: 'Energy drink', price: 120, category: 'DRINKS' },
                { name: 'Chips', description: 'Potato chips pack', price: 50, category: 'SNACKS' },
                { name: 'Popcorn', description: 'Fresh popcorn', price: 80, category: 'SNACKS' },
            ],
        });
        console.log('Created shop items');
    }
    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest data:');
    console.log(`- User ID: ${user.id}`);
    console.log(`- Organizer ID: ${organizer.id}`);
    console.log(`- Event ID: ${event.id}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map