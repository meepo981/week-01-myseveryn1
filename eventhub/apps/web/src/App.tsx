
import { Routes, Route } from "react-router-dom";

import { EventList } from "./features/catalog/EventList";
import { CatalogFilters } from "./features/catalog/CatalogFilters";
import { EventDetails } from "./features/catalog/EventDetails";

function CatalogPage() {
  return (
    <main className="page">
      <header className="page__header">
        <h1>EventHub</h1>
        <p className="page__subtitle">
          Квитки на події
        </p>
      </header>

      <CatalogFilters />
      <EventList />
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route
        path="/events/:eventId"
        element={<EventDetails />}
      />
      <Route
        path="*"
        element={
          <main className="page">
            <h1>Сторінку не знайдено</h1>
          </main>
        }
      />
    </Routes>
  );
}
