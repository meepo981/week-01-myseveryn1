
import {
  getAccessToken,
  setAccessToken
} from "./authToken";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

let refreshInFlight: Promise<boolean> | null = null;

export function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include"
          }
        );

        if (!response.ok) {
          setAccessToken(null);
          return false;
        }

        const data = await response.json() as {
          accessToken: string;
        };

        setAccessToken(data.accessToken);
        return true;
      } catch {
        setAccessToken(null);
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

function withToken(request: Request): Request {
  const headers = new Headers(request.headers);
  const token = getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return new Request(request, {
    headers,
    credentials: "include"
  });
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const request = new Request(input, init);

  const firstResponse = await fetch(withToken(request));

  const isAuthRoute =
    new URL(request.url).pathname.includes("/auth/");

  if (firstResponse.status !== 401 || isAuthRoute) {
    return firstResponse;
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    return firstResponse;
  }

  return fetch(withToken(request.clone()));
}
