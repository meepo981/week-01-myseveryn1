
import { Injectable } from "@nestjs/common";
import type { Event } from "@eventhub/contracts";
import { PrismaService } from "../prisma/prisma.service";

export interface CursorPosition {
  startsAt: string;
  id: string;
}

export interface FindParams {
  city?: string;
  from?: string;
  after?: CursorPosition;
  limit: number;
}

export function byStartThenId(a: Event, b: Event): number {
  return a.startsAt.localeCompare(b.startsAt) ||
    a.id.localeCompare(b.id);
}

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async toEvent(row: {
    id: string;
    title: string;
    description: string | null;
    startsAt: Date;
    venue: {
      id: string;
      name: string;
      city: string;
    };
  }): Promise<Event> {
    const availableSeats = await this.prisma.seat.count({
      where: {
        eventId: row.id,
        status: "available"
      }
    });

    return {
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      startsAt: row.startsAt.toISOString(),
      venue: {
        id: row.venue.id,
        name: row.venue.name,
        city: row.venue.city
      },
      minPrice: {
        amount: 0,
        currency: "UAH"
      },
      availableSeats
    };
  }

  async find(params: FindParams): Promise<Event[]> {
    const rows = await this.prisma.event.findMany({
      where: {
        venue: params.city
          ? {
              city: {
                equals: params.city,
                mode: "insensitive"
              }
            }
          : undefined,

        startsAt: params.from
          ? {
              gte: new Date(`${params.from}T00:00:00Z`)
            }
          : undefined,

        OR: params.after
          ? [
              {
                startsAt: {
                  gt: new Date(params.after.startsAt)
                }
              },
              {
                startsAt: new Date(params.after.startsAt),
                id: { gt: params.after.id }
              }
            ]
          : undefined
      },

      include: {
        venue: true
      },

      orderBy: [
        { startsAt: "asc" },
        { id: "asc" }
      ],

      take: params.limit + 1
    });

    return Promise.all(
      rows.map((row) => this.toEvent(row))
    );
  }

  async byId(id: string): Promise<Event | undefined> {
    const row = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true }
    });

    if (!row) return undefined;

    return this.toEvent(row);
  }
}
