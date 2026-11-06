
let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(value: string | null) {
  accessToken = value;
}
