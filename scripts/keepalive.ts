import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function run() {
  console.log("Starting TeLos Keep-Alive probe...");
  const appUrl = process.env.APP_URL;
  if (appUrl) {
    try {
      const cleanUrl = appUrl.replace(/\/+$/, "");
      const res = await fetch(`${cleanUrl}/health`);
      const body = await res.json().catch(() => null);
      console.log(`HTTP ping to ${cleanUrl}/health: status ${res.status}`, body);
    } catch (err: any) {
      console.warn("HTTP keepalive warning:", err?.message);
    }
  }

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    try {
      await prisma.$connect();
      const result = await prisma.$queryRaw`SELECT 1 as ping`;
      console.log("Database keep-alive ping successful (SELECT 1):", result);
    } catch (err: any) {
      console.error("Database keepalive ping error:", err?.message);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log("No DATABASE_URL set; skipping direct database probe.");
  }
}

run()
  .then(() => {
    console.log("Keep-alive probe complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Keep-alive probe failed:", err);
    process.exit(1);
  });
