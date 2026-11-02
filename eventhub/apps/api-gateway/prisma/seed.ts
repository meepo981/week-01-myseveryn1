
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const venueId = "11111111-1111-4111-8111-111111111111";

  await prisma.venue.upsert({
    where: { id: venueId },
    update: {},
    create: {
      id: venueId,
      name: "Палац спорту",
      city: "Київ",
      address: "Спортивна площа, 1"
    }
  });

  const events = [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
      title: "Концерт сучасної музики",
      description: "Музичний вечір",
      startsAt: new Date("2026-12-10T18:00:00Z"),
      venueId
    },
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
      title: "Технологічна конференція",
      description: "Конференція про IT",
      startsAt: new Date("2026-12-15T10:00:00Z"),
      venueId
    },
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
      title: "Рок-фестиваль",
      description: "Виступи музичних гуртів",
      startsAt: new Date("2026-12-20T17:00:00Z"),
      venueId
    }
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: event,
      create: event
    });

    for (let number = 1; number <= 10; number++) {
      await prisma.seat.upsert({
        where: {
          eventId_row_number: {
            eventId: event.id,
            row: 1,
            number
          }
        },
        update: {},
        create: {
          eventId: event.id,
          row: 1,
          number,
          status: "available"
        }
      });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
