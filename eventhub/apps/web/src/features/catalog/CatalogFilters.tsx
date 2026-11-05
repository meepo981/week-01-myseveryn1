
import { useCatalogFilters } from "./useCatalogFilters";

export function CatalogFilters() {
  const {
    filters,
    setFilter,
    reset,
    hasFilters
  } = useCatalogFilters();

  return (
    <div className="catalog-filters">
      <label>
        Місто
        <select
          value={filters.city ?? ""}
          onChange={(e) =>
            setFilter("city", e.target.value)
          }
        >
          <option value="">Усі міста</option>
          <option value="Київ">Київ</option>
          <option value="Львів">Львів</option>
          <option value="Одеса">Одеса</option>
          <option value="Вінниця">Вінниця</option>
        </select>
      </label>

      <label>
        Дата від
        <input
          type="date"
          value={filters.from ?? ""}
          onChange={(e) =>
            setFilter("from", e.target.value)
          }
        />
      </label>

      {hasFilters && (
        <button onClick={reset}>
          Скинути фільтри
        </button>
      )}
    </div>
  );
}
