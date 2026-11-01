
import { HttpException } from "@nestjs/common";
import {
  EventNotFound,
  InvalidCursor,
  RequestValidationFailed
} from "./domain-errors";

export interface ProblemBody {
  type: string;
  title: string;
  status: number;
  detail?: string;
  errors?: unknown[];
}

export function toProblem(err: unknown): ProblemBody {
  if (err instanceof RequestValidationFailed) {
    return {
      type: "/errors/invalid-query",
      title: "Некоректний параметр запиту",
      status: 400,
      detail: err.issues
        .map((i) => `${i.field}: ${i.message}`)
        .join("; "),
      errors: err.issues
    };
  }

  if (err instanceof InvalidCursor) {
    return {
      type: "/errors/invalid-query",
      title: "Некоректний курсор",
      status: 400,
      detail: err.message
    };
  }

  if (err instanceof EventNotFound) {
    return {
      type: "/errors/not-found",
      title: "Подію не знайдено",
      status: 404,
      detail: err.message
    };
  }

  if (err instanceof HttpException) {
    const status = err.getStatus();

    return {
      type: status === 404
        ? "/errors/not-found"
        : "about:blank",
      title: status === 404
        ? "Ресурс не знайдено"
        : "Помилка HTTP",
      status,
      detail: status < 500 ? err.message : undefined
    };
  }

  return {
    type: "about:blank",
    title: "Внутрішня помилка сервера",
    status: 500
  };
}
