
import { api } from "./client";
import type { Event, EventPage } from "@eventhub/contracts";
import type { CatalogFilters } from "../features/catalog/useCatalogFilters";

export const PAGE_SIZE = 6;

export async function fetchEvents(
  filters: CatalogFilters,
  cursor?: string
): Promise<EventPage> {
  const { data, error } = await api.GET("/events", {
    params: {
      query: {
        ...(filters.city ? { city: filters.city } : {}),
        ...(filters.from ? { from: filters.from } : {}),
        ...(cursor ? { cursor } : {}),
        limit: PAGE_SIZE
      }
    }
  });

  if (error) throw error;
  if (!data) throw new Error("Немає даних");

  return data;
}

export async function fetchEvent(
  eventId: string
): Promise<Event> {
  const { data, error } = await api.GET(
    "/events/{eventId}",
    {
      params: {
        path: { eventId }
      }
    }
  );

  if (error) throw error;
  if (!data) throw new Error("Подію не знайдено");

  return data;
}
