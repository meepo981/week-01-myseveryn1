
import createClient from "openapi-fetch";
import type { paths } from "@eventhub/contracts";
import { authFetch } from "./authFetch";

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL || "/api",
  fetch: authFetch
});
