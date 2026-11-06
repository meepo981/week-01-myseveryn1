
import { setAccessToken } from "./authToken";
import { refreshAccessToken } from "./authFetch";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export type User = {
  id: string;
  email: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
};

type AuthResponse = {
  accessToken: string;
  user: User;
};

async function authRequest(
  route: "login" | "register",
  email: string,
  password: string
): Promise<User> {
  const response = await fetch(
    `${BASE_URL}/auth/${route}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    }
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "Неправильна пошта або пароль"
        : response.status === 409
          ? "Цю пошту вже зареєстровано"
          : "Не вдалося виконати запит"
    );
  }

  const result = await response.json() as AuthResponse;
  setAccessToken(result.accessToken);

  return result.user;
}

export function login(email: string, password: string) {
  return authRequest("login", email, password);
}

export function register(email: string, password: string) {
  return authRequest("register", email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${(
        await import("./authToken")
      ).getAccessToken() ?? ""}`
    },
    credentials: "include"
  });

  if (!response.ok) return null;

  return response.json() as Promise<User>;
}

export async function restoreSession(): Promise<User | null> {
  const ok = await refreshAccessToken();

  if (!ok) return null;

  return getCurrentUser();
}

export async function logout() {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
  } finally {
    setAccessToken(null);
  }
}
