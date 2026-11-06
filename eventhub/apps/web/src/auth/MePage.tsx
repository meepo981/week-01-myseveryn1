
import { useAuth } from "./AuthContext";

export function MePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <main className="page">
      <section className="auth-form">
        <h1>Особистий кабінет</h1>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Роль:</strong> {user.role}
        </p>

        <p>
          <strong>ID:</strong> {user.id}
        </p>

        <p>Ви успішно увійшли до EventHub.</p>
      </section>
    </main>
  );
}
