
import {
  Link,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";

import { EventList } from "./features/catalog/EventList";
import { CatalogFilters } from "./features/catalog/CatalogFilters";
import { EventDetails } from "./features/catalog/EventDetails";

import { LoginPage } from "./auth/LoginPage";
import { MePage } from "./auth/MePage";
import { RequireAuth } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthContext";

function Header() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  return (
    <header className="site-header">
      <Link to="/">EventHub</Link>

      <nav>
        <Link to="/">Каталог</Link>

        {!loading && (
          user ? (
            <>
              <Link to="/me">{user.email}</Link>
              <button onClick={() => void handleLogout()}>
                Вийти
              </button>
            </>
          ) : (
            <Link to="/login">Увійти</Link>
          )
        )}
      </nav>
    </header>
  );
}

function CatalogPage() {
  return (
    <main className="page">
      <h1>EventHub</h1>
      <p>Квитки на події</p>

      <CatalogFilters />
      <EventList />
    </main>
  );
}

export function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<CatalogPage />} />

        <Route
          path="/events/:eventId"
          element={<EventDetails />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/me"
          element={
            <RequireAuth>
              <MePage />
            </RequireAuth>
          }
        />

        <Route
          path="*"
          element={<p>Сторінку не знайдено</p>}
        />
      </Routes>
    </>
  );
}
