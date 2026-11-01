
import type { Event } from "@eventhub/contracts";

export const EVENTS: Event[] = [
  {
    id: "018f2c1e-4a7b-7c3d-9e1f-2a5b6c7d8e9f",
    title: "Симфонічний вечір",
    startsAt: "2026-10-12T19:00:00Z",
    venue: {
      id: "018f2c1e-0000-7c3d-9e1f-2a5b6c7d8e00",
      name: "Філармонія",
      city: "Вінниця"
    },
    minPrice: { amount: 25000, currency: "UAH" },
    availableSeats: 143
  },
  {
    id: "018f2c1e-4a7b-7c3d-9e1f-2a5b6c7d8ea0",
    title: "Джазовий квартет",
    startsAt: "2026-10-19T20:00:00Z",
    venue: {
      id: "018f2c1e-0000-7c3d-9e1f-2a5b6c7d8e01",
      name: "Клуб Підвал",
      city: "Вінниця"
    },
    minPrice: { amount: 18000, currency: "UAH" },
    availableSeats: 12
  },
  {
    id: "018f2c1e-4a7b-7c3d-9e1f-2a5b6c7d8ea1",
    title: "Рок-фестиваль",
    startsAt: "2026-10-19T20:00:00Z",
    venue: {
      id: "018f2c1e-0000-7c3d-9e1f-2a5b6c7d8e02",
      name: "Арена Львів",
      city: "Львів"
    },
    minPrice: { amount: 45000, currency: "UAH" },
    availableSeats: 500
  },
  {
    id: "018f2c1e-4a7b-7c3d-9e1f-2a5b6c7d8ea2",
    title: "Театральна вистава",
    startsAt: "2026-11-05T18:00:00Z",
    venue: {
      id: "018f2c1e-0000-7c3d-9e1f-2a5b6c7d8e03",
      name: "Міський театр",
      city: "Одеса"
    },
    minPrice: { amount: 30000, currency: "UAH" },
    availableSeats: 85
  }
];
