import createClient from "openapi-fetch";
import type { paths } from "@eventhub/contracts";

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});