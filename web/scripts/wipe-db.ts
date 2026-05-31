/**
 * Delete all customers, mechanics, and bookings from the database.
 * Run: npm run db:wipe
 */
import { prisma } from "../lib/db";

async function main() {
  const bookings = await prisma.booking.deleteMany();
  const mechanics = await prisma.mechanic.deleteMany();
  const customers = await prisma.customer.deleteMany();

  console.log(
    `Wiped: ${bookings.count} booking(s), ${mechanics.count} mechanic(s), ${customers.count} customer(s).`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
