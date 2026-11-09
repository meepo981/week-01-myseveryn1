
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getOrganizerEvents } from "./organizerApi";

export function OrganizerPage() {
  const {
    data: events,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organizer", "events"],
    queryFn: getOrganizerEvents,
    retry: false,
  });

  if (isPending) {
    return (
      <main className="page">
        <p>Завантаження подій...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="page">
        <h2>Помилка завантаження</h2>
        <p>{error.message}</p>
        <button onClick={() => void refetch()}>
          Спробувати ще раз
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Кабінет організатора</h1>
      <p>Керування подіями EventHub</p>

      {events.length === 0 ? (
        <p>У вас поки немає подій.</p>
      ) : (
        <div className="organizer-list">
          {events.map((event) => (
            <article
              key={event.id}
              className="organizer-card"
            >
              <h3>{event.title}</h3>

              <p>
                <strong>Місто:</strong>{" "}
                {event.venue.city}
              </p>

              <p>
                <strong>Дата:</strong>{" "}
                {new Date(event.startsAt)
                  .toLocaleString("uk-UA")}
              </p>

              <Link
                to={`/organizer/events/${event.id}`}
                className="organizer-edit"
              >
                Редагувати подію
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
