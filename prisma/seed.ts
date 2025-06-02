// Explicitly load environment variables from a .env file
require('dotenv').config();

const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function seedUserRoles() {
  const roles = [
    { name: 'CUSTOMER', description: 'Customer role' },
    { name: 'OWNER', description: 'Shop Owner role' },
    { name: 'ADMIN', description: 'System Administrator role' },
  ];

  console.log('Starting to seed UserRoles...');
  for (const role of roles) {
    const existingRole = await prisma.userRole.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.userRole.create({
        data: { name: role.name, description: role.description },
      });
      console.log(`Created role: ${role.name}`);
    } else {
      if (existingRole.description !== role.description) {
        await prisma.userRole.update({
          where: { name: role.name },
          data: { description: role.description },
        });
        console.log(`Updated description for role: ${role.name}`);
      } else {
        console.log(`Role "${role.name}" already exists with the same description.`);
      }
    }
  }
  console.log('Finished seeding UserRoles.');
}

async function seedIngredientPriceHistory() {
  console.log('Starting to seed IngredientPriceHistory...');
  const ingredients = ['Flour', 'Sugar', 'Eggs', 'Butter', 'Chocolate'];
  const suppliers = ['Supplier A', 'Supplier B', 'Bulk Goods Inc.'];
  const records = [];

  // Generate data for the last 6 months (approx 24 weeks)
  const today = new Date();
  for (let i = 24; i >= 0; i--) { // Go back 24 weeks (6 months)
    const date = new Date(today);
    date.setDate(today.getDate() - (i * 7)); // Set date to i weeks ago

    for (const ingredient of ingredients) {
      let basePrice;
      switch (ingredient) {
        case 'Flour': basePrice = 10; break;
        case 'Sugar': basePrice = 15; break;
        case 'Eggs': basePrice = 2.5; break; // Price per dozen or unit
        case 'Butter': basePrice = 5; break; // Price per block/unit
        case 'Chocolate': basePrice = 20; break; // Price per kg/unit
        default: basePrice = 1;
      }
      // Simulate some price fluctuation (+/- 10% of base, and slight upward trend)
      const priceFluctuation = (Math.random() - 0.5) * (basePrice * 0.1);
      const trendFactor = (basePrice * 0.005) * (24 - i); // Slight increase over time
      const price = parseFloat((basePrice + priceFluctuation + trendFactor).toFixed(2));

      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];

      // Check if a record for this ingredient and date already exists to avoid duplicates
      // This is a simple check; for true upsert behavior, more complex logic or db features might be needed
      // if we weren't deleting all records first.
      // For this seed, we assume we want fresh data each time or that duplicates are okay for now if not deleting.
      // To make it idempotent for *this run*, we can skip if already added to `records` for this specific date.
      // However, Prisma's `createMany` doesn't support `upsert`.
      // A common seed strategy is to delete existing seeded data first.

      records.push({
        ingredientName: ingredient,
        price: price,
        date: date,
        supplier: supplier,
      });
    }
  }

  // Optional: Clear existing ingredient price history before seeding new data
  // This makes the seed script idempotent in terms of the final state of this data.
  console.log('Deleting existing ingredient price history...');
  await prisma.ingredientPriceHistory.deleteMany({}); // Deletes all records in the collection

  console.log(`Attempting to seed ${records.length} ingredient price history records...`);
  try {
    const result = await prisma.ingredientPriceHistory.createMany({
      data: records,
      skipDuplicates: true, // Good for general case, but deleteMany makes it cleaner for full refresh
    });
    console.log(`Successfully seeded ${result.count} ingredient price history records.`);
  } catch (e) {
    console.error('Error during createMany for IngredientPriceHistory:', e);
    // Log specific records if possible, or parts of them, for debugging
    if (records.length > 0) {
        console.error('Sample record that might have caused issue:', JSON.stringify(records[0], null, 2));
    }
  }

  console.log('Finished seeding IngredientPriceHistory.');
}


async function main() {
  console.log(`DATABASE_URL is: ${process.env.DATABASE_URL ? 'set' : 'not set'}`);
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set. Seed script cannot run.');
    process.exit(1); // Exit if DATABASE_URL is not set
  }

  await seedUserRoles();
  await seedIngredientPriceHistory();
}

main()
  .catch((e) => {
    console.error('Error during seeding process:', e);
    if (e.code) {
      console.error(`Prisma Error Code: ${e.code}`);
    }
    if (e.meta) {
      console.error(`Prisma Error Meta: ${JSON.stringify(e.meta)}`);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });
