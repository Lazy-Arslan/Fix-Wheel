/**
 * Import existing web/data/*.csv into Supabase PostgreSQL.
 * Run after: npm run db:push
 */
import fs from "fs";
import path from "path";
import { prisma } from "../lib/db";
import { normalizeCnic } from "../lib/validation";

const DATA_DIR = path.join(process.cwd(), "data");

function parseCsvLine(line: string): string[] {
  return line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((s) => {
    let t = s.trim();
    if (t.startsWith('"') && t.endsWith('"')) {
      t = t.slice(1, -1).replace(/""/g, '"');
    }
    return t;
  });
}

async function importCustomers() {
  const file = path.join(DATA_DIR, "customers.csv");
  if (!fs.existsSync(file)) return 0;

  const lines = fs.readFileSync(file, "utf-8").split(/\r?\n/);
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols.length < 5) continue;

    const cnic = normalizeCnic(cols[1]);
    if (cnic.length !== 13) continue;

    try {
      await prisma.customer.upsert({
        where: { cnic },
        create: {
          name: cols[0],
          cnic,
          email: cols[2],
          phone: cols[3],
          city: cols[4],
          bikeModel: cols[5] ?? "",
          carModel: cols[6] ?? "",
          address: cols[7] ?? "",
        },
        update: {},
      });
      count++;
    } catch {
      /* skip */
    }
  }
  return count;
}

async function importMechanics() {
  const file = path.join(DATA_DIR, "mechanics.csv");
  if (!fs.existsSync(file)) return 0;

  const lines = fs.readFileSync(file, "utf-8").split(/\r?\n/);
  let count = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    if (cols.length < 12) continue;

    const cnic = normalizeCnic(cols[1]);
    if (cnic.length !== 13) continue;

    try {
      await prisma.mechanic.upsert({
        where: { cnic },
        create: {
          name: cols[0],
          cnic,
          email: cols[2],
          phone: cols[3],
          city: cols[4],
          shopName: cols[5],
          license: cols[6],
          specialization: cols[7],
          experience: cols[8] ?? "",
          address: cols[9] ?? "",
          lat: parseFloat(cols[10]) || 0,
          lng: parseFloat(cols[11]) || 0,
        },
        update: {},
      });
      count++;
    } catch {
      /* skip */
    }
  }
  return count;
}

async function main() {
  const customers = await importCustomers();
  const mechanics = await importMechanics();
  console.log(`Imported ${customers} customer(s), ${mechanics} mechanic(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
