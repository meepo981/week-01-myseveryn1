
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { login, register } from "../api/auth";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const user = mode === "login"
        ? await login(email, password)
        : await register(email, password);

      setUser(user);
      navigate("/me", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Виникла помилка"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="auth-form">
        <h1>
          {mode === "login"
            ? "Вхід до EventHub"
            : "Реєстрація"}
        </h1>

        <form onSubmit={(event) => void submit(event)}>
          <label>
            Електронна пошта
            <input
              type="email"
              required
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Пароль
            <input
              type="password"
              required
              minLength={mode === "register" ? 10 : undefined}
              maxLength={128}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button disabled={submitting} type="submit">
            {submitting
              ? "Зачекайте..."
              : mode === "login"
                ? "Увійти"
                : "Зареєструватися"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Створити обліковий запис"
            : "У мене вже є акаунт"}
        </button>
      </section>
    </main>
  );
}
