
import { Injectable } from "@nestjs/common";
import type { Event } from "@eventhub/contracts";
import { EVENTS } from "./seed";

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
  private readonly events: Event[] =
    [...EVENTS].sort(byStartThenId);

  async find(params: FindParams): Promise<Event[]> {
    let rows = this.events;

    if (params.city) {
      const needle = params.city.toLocaleLowerCase("uk");
      rows = rows.filter(
        (e) => e.venue.city.toLocaleLowerCase("uk") === needle
      );
    }

    if (params.from) {
      rows = rows.filter(
        (e) => e.startsAt >= `${params.from}T00:00:00Z`
      );
    }

    if (params.after) {
      const { startsAt, id } = params.after;
      rows = rows.filter(
        (e) =>
          e.startsAt > startsAt ||
          (e.startsAt === startsAt && e.id > id)
      );
    }

    return rows.slice(0, params.limit + 1);
  }

  async byId(id: string): Promise<Event | undefined> {
    return this.events.find((e) => e.id === id);
  }
}
