
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type CatalogFilters = {
  city?: string;
  from?: string;
};

export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();

  const city = params.get("city") || undefined;
  const from = params.get("from") || undefined;

  const filters = useMemo<CatalogFilters>(
    () => ({ city, from }),
    [city, from]
  );

  const setFilter = useCallback(
    (key: keyof CatalogFilters, value: string) => {
      setParams((previous) => {
        const next = new URLSearchParams(previous);

        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }

        return next;
      });
    },
    [setParams]
  );

  const reset = useCallback(() => {
    setParams({});
  }, [setParams]);

  const hasFilters = Boolean(city || from);

  return {
    filters,
    setFilter,
    reset,
    hasFilters
  };
}
