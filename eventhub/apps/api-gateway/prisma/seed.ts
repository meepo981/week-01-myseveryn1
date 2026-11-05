
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const kyivId = "11111111-1111-4111-8111-111111111111";
const lvivId = "22222222-2222-4222-8222-222222222222";
const odesaId = "33333333-3333-4333-8333-333333333333";

const venues = [
  {
    id: kyivId,
    name: "Палац спорту",
    city: "Київ",
    address: "Спортивна площа, 1"
  },
  {
    id: lvivId,
    name: "Арена Львів",
    city: "Львів",
    address: "вул. Стрийська, 199"
  },
  {
    id: odesaId,
    name: "Міський концертний зал",
    city: "Одеса",
    address: "Центр міста"
  }
];

const eventData = [
  ["Концерт сучасної музики", "2026-12-10T18:00:00Z", kyivId],
  ["Технологічна конференція", "2026-12-15T10:00:00Z", kyivId],
  ["Рок-фестиваль", "2026-12-20T17:00:00Z", kyivId],
  ["Джазовий вечір", "2026-12-21T18:00:00Z", lvivId],
  ["Фестиваль мистецтва", "2026-12-22T15:00:00Z", odesaId],
  ["IT Meetup", "2026-12-23T12:00:00Z", lvivId],
  ["Театральна вистава", "2026-12-24T17:00:00Z", kyivId],
  ["Музичний фестиваль", "2026-12-25T18:00:00Z", odesaId],
  ["Конференція розробників", "2026-12-26T09:00:00Z", lvivId],
  ["Новорічний концерт", "2026-12-30T19:00:00Z", kyivId]
] as const;

async function main() {
  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { id: venue.id },
      update: venue,
      create: venue
    });
  }

  for (let i = 0; i < eventData.length; i++) {
    const [title, date, venueId] = eventData[i];

    const id =
      i < 3
        ? `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa${i + 1}`
        : `bbbbbbbb-bbbb-4bbb-8bbb-${String(i + 1).padStart(12, "0")}`;

    await prisma.event.upsert({
      where: { id },
      update: {
        title,
        startsAt: new Date(date),
        venueId
      },
      create: {
        id,
        title,
        description: "Подія EventHub",
        startsAt: new Date(date),
        venueId
      }
    });

    for (let number = 1; number <= 10; number++) {
      await prisma.seat.upsert({
        where: {
          eventId_row_number: {
            eventId: id,
            row: 1,
            number
          }
        },
        update: {},
        create: {
          eventId: id,
          row: 1,
          number,
          status: "available"
        }
      });
    }
  }

  console.log("Створено 3 майданчики та 10 подій");
}


main()
  .catch((error) => {
    console.error("Помилка наповнення бази:", error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

