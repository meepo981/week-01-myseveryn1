import { useEffect, useState } from "react";
import type { Event } from "@eventhub/contracts";
import { api } from "../../api/client";

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    api
      .GET("/events", { params: { query: { limit: 20 } } })
      .then(({ data, error }) => {
        if (error) {
          setProblem(error.title);
          return;
        }

        if (data) {
          setEvents(data.items);
        }
      });
  }, []);

  if (problem) {
    return <p role="alert">{problem}</p>;
  }

  return (
    <ul className="event-list">
      {events.map((e) => (
        <li key={e.id}>
          <strong>{e.title}</strong> – {e.venue.city},{" "}
          {new Date(e.startsAt).toLocaleString("uk-UA")}
          {" · від "}
          {(e.minPrice.amount / 100).toFixed(2)} грн
        </li>
      ))}
    </ul>
  );
}