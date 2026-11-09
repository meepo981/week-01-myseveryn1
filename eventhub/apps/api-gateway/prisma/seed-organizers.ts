
import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const password = "eventhub-demo-2026";

async function main() {
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });

  const users = [
    { email: "student@example.com", role: Role.USER },
    { email: "organizer@example.com", role: Role.ORGANIZER },
    { email: "organizer2@example.com", role: Role.ORGANIZER },
    { email: "admin@example.com", role: Role.ADMIN },
  ];

  for (const item of users) {
    await prisma.user.upsert({
      where: { email: item.email },
      update: { role: item.role },
      create: {
        email: item.email,
        role: item.role,
        passwordHash,
        emailVerified: false,
      },
    });
  }

  const organizer1 = await prisma.user.findUniqueOrThrow({
    where: { email: "organizer@example.com" },
  });

  const organizer2 = await prisma.user.findUniqueOrThrow({
    where: { email: "organizer2@example.com" },
  });

  const events = await prisma.event.findMany({
    orderBy: [
      { startsAt: "asc" },
      { id: "asc" },
    ],
  });

  if (events.length !== 10) {
    throw new Error(
      `Очікується 10 подій, знайдено ${events.length}`
    );
  }

  for (let i = 0; i < events.length; i++) {
    await prisma.event.update({
      where: { id: events[i].id },
      data: {
        organizerId:
          i < 5 ? organizer1.id : organizer2.id,
      },
    });
  }

  console.log("Створено 4 тестових користувачів");
  console.log("Перші 5 подій — organizer@example.com");
  console.log("Останні 5 подій — organizer2@example.com");
}

main()
  .catch((error) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
