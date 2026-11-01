
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { randomUUID } from "node:crypto";
import { LoggerModule } from "nestjs-pino";
import { CatalogModule } from "./catalog/catalog.module";
import { ProblemFilter } from "./common/problem/problem.filter";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || "debug",

        genReqId: (req, res) => {
          const incoming = req.headers["x-request-id"];

          const id =
            typeof incoming === "string" && incoming
              ? incoming
              : randomUUID();

          res.setHeader("x-request-id", id);
          return id;
        },

        redact: [
          "req.headers.authorization",
          "req.headers.cookie",
          "res.headers['set-cookie']"
        ],

        transport:
          process.env.NODE_ENV === "development"
            ? {
                target: "pino-pretty",
                options: { singleLine: true }
              }
            : undefined
      }
    }),

    CatalogModule
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: ProblemFilter
    }
  ]
})
export class AppModule {}
