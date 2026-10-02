import { db, pool } from "./index.js";
import { leadSourceEnum, leadStatusEnum, leads, notes, propertyTypeEnum, type NewLead } from "./schema.js";

const names = [
  "Aarav Shah", "Priya Nair", "Rohan Mehta", "Sneha Kulkarni", "Vikram Rao",
  "Ananya Iyer", "Karan Desai", "Meera Joshi", "Arjun Patil", "Isha Verma",
  "Siddharth Kapoor", "Neha Gupta", "Rahul Menon", "Pooja Shetty", "Aditya Singh",
];
const locations = ["Thane West", "Powai", "Andheri East", "Navi Mumbai", "Borivali", "Pune - Baner", "Kharghar"];

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  await db.delete(notes);
  await db.delete(leads);

  const rows: NewLead[] = names.map((name, i) => ({
    name,
    phone: `98${String(10_000_000 + i * 7919).slice(0, 8)}`,
    email: `${name.split(" ")[0].toLowerCase()}@example.com`,
    budget: (40 + Math.floor(Math.random() * 260)) * 100_000, // ₹40L – ₹3Cr
    location: pick(locations),
    propertyType: pick(propertyTypeEnum.enumValues),
    source: pick(leadSourceEnum.enumValues),
    status: pick(leadStatusEnum.enumValues),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 86_400_000),
  }));

  const inserted = await db.insert(leads).values(rows).returning({ id: leads.id });
  await db.insert(notes).values(
    inserted.filter((_, i) => i % 3 === 0).map((l) => ({ leadId: l.id, content: "Called once, asked for brochure." })),
  );

  console.log(`Seeded ${inserted.length} leads`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
