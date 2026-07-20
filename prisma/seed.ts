import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  const studentPasswordHash = await bcrypt.hash("student1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@greasy.app" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@greasy.app",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "student@greasy.app" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@greasy.app",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
    },
  });

  console.log("Seed complete: 2 users. No sample vocab sets are created — import real data via /admin/import.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
