
type ErrorStateProps = {
  error: unknown;
  onRetry: () => void;
};

function titleOf(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "title" in error
  ) {
    return String(error.title);
  }

  return "Не вдалося завантажити дані";
}

export function EventListSkeleton() {
  return (
    <div className="event-list">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="event-skeleton"
        />
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="event-state" role="alert">
      <h2>Помилка завантаження</h2>
      <p>{titleOf(error)}</p>
      <button onClick={onRetry}>
        Спробувати ще раз
      </button>
    </div>
  );
}

type EmptyStateProps = {
  hasFilters: boolean;
  onReset: () => void;
};

export function EmptyState({
  hasFilters,
  onReset,
}: EmptyStateProps) {
  return (
    <div className="event-state">
      <h2>Подій не знайдено</h2>
      <p>
        {hasFilters
          ? "Спробуйте змінити параметри пошуку."
          : "Наразі подій немає."}
      </p>

      {hasFilters && (
        <button onClick={onReset}>
          Скинути фільтри
        </button>
      )}
    </div>
  );
}
