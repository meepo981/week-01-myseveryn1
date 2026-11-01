
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter
} from "@nestjs/common";
import {
  InjectPinoLogger,
  PinoLogger
} from "nestjs-pino";
import type { Request, Response } from "express";
import { toProblem } from "./problem";

@Catch()
export class ProblemFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(ProblemFilter.name)
    private readonly logger: PinoLogger
  ) {}

  catch(err: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const problem = toProblem(err);

    if (problem.status >= 500) {
      this.logger.error(
        { err, url: req.url },
        "unhandled error"
      );
    } else {
      this.logger.debug(
        { type: problem.type, url: req.url },
        "request rejected"
      );
    }

    res
      .status(problem.status)
      .type("application/problem+json")
      .json({
        ...problem,
        instance: req.originalUrl
      });
  }
}
