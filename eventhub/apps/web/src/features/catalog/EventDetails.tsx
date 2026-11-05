
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  useLocation,
  useParams
} from "react-router-dom";

import { fetchEvent } from "../../api/queries";
import { eventKeys } from "../../api/queryKeys";

import {
  EventListSkeleton,
  ErrorState
} from "./EventStates";

export function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();

  const state = location.state as
    | { from?: string }
    | null;

  const backTo = "/" + (state?.from ?? "");

  const {
    data: event,
    isPending,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: eventKeys.detail(eventId ?? ""),
    queryFn: () => fetchEvent(eventId!),
    enabled: Boolean(eventId)
  });

  if (isPending) {
    return <EventListSkeleton />;
  }

  if (isError) {
    return (
      <div>
        <ErrorState
          error={error}
          onRetry={() => void refetch()}
        />
        <Link to={backTo}>До каталогу</Link>
      </div>
    );
  }

  if (!event) return null;

  return (
    <main className="page">
      <Link to={backTo} className="back-link">
        ← До каталогу
      </Link>

      <div className="event-details">
        <h1>{event.title}</h1>

        <p>
          <strong>Місто:</strong> {event.venue.city}
        </p>

        <p>
          <strong>Місце проведення:</strong>{" "}
          {event.venue.name}
        </p>

        <p>
          <strong>Дата:</strong>{" "}
          {new Date(event.startsAt)
            .toLocaleString("uk-UA")}
        </p>

        <p>
          <strong>Ціна від:</strong>{" "}
          {(event.minPrice.amount / 100).toFixed(2)}
          {" грн"}
        </p>

        <p>
          <strong>Доступні місця:</strong>{" "}
          {event.availableSeats}
        </p>

        {event.description && (
          <p>{event.description}</p>
        )}
      </div>
    </main>
  );
}
