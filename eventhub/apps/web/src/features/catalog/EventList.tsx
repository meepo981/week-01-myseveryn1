
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";

import { fetchEvents } from "../../api/queries";
import { eventKeys } from "../../api/queryKeys";
import { useCatalogFilters } from "./useCatalogFilters";

import {
  EventListSkeleton,
  ErrorState,
  EmptyState
} from "./EventStates";

export function EventList() {
  const { filters, reset, hasFilters } =
    useCatalogFilters();

  const location = useLocation();

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: eventKeys.list(filters),

    queryFn: ({ pageParam }) =>
      fetchEvents(filters, pageParam),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ?? undefined
  });

  if (isPending) {
    return <EventListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  const events = data.pages.flatMap(
    (page) => page.items
  );

  if (events.length === 0) {
    return (
      <EmptyState
        hasFilters={hasFilters}
        onReset={reset}
      />
    );
  }

  return (
    <div>
      <ul className="event-list">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to={`/events/${event.id}`}
              state={{ from: location.search }}
              className="event-link"
            >
              <strong>{event.title}</strong>
            </Link>

            {" – "}
            {event.venue.city}
            {", "}
            {new Date(event.startsAt).toLocaleString("uk-UA")}

            {" · від "}
            {(event.minPrice.amount / 100).toFixed(2)}
            {" грн"}
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <button
          className="load-more"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage
            ? "Завантаження..."
            : "Показати ще"}
        </button>
      )}
    </div>
  );
}
