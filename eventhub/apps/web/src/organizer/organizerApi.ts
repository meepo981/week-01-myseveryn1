
import { authFetch } from "../api/authFetch";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export type OrganizerEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  organizerId: string | null;
  venueId: string;
  venue: {
    id: string;
    name: string;
    city: string;
  };
};

async function readResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    throw new Error(
      `Помилка сервера: HTTP ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getOrganizerEvents() {
  const response = await authFetch(
    `${BASE_URL}/organizer/events`
  );

  return readResponse<OrganizerEvent[]>(response);
}

export async function updateOrganizerEvent(
  id: string,
  changes: {
    title?: string;
    description?: string;
    startsAt?: string;
  }
) {
  const response = await authFetch(
    `${BASE_URL}/organizer/events/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
    }
  );

  return readResponse<OrganizerEvent>(response);
}
