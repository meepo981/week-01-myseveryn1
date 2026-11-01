
import { InvalidCursor } from "../common/problem/domain-errors";
import type { CursorPosition } from "./event.repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeCursor(pos: CursorPosition): string {
  return Buffer.from(
    `${pos.startsAt}|${pos.id}`,
    "utf8"
  ).toString("base64url");
}

export function decodeCursor(raw: string): CursorPosition {
  try {
    const decoded = Buffer.from(raw, "base64url")
      .toString("utf8");

    const parts = decoded.split("|");
    const startsAt = parts[0];
    const id = parts[1];

    if (
      parts.length !== 2 ||
      !startsAt ||
      !id ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(startsAt) ||
      !Number.isFinite(Date.parse(startsAt)) ||
      !UUID_PATTERN.test(id) ||
      Buffer.from(decoded, "utf8").toString("base64url") !== raw
    ) {
      throw new InvalidCursor(raw);
    }

    return { startsAt, id };
  } catch {
    throw new InvalidCursor(raw);
  }
}
