
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import {
  OrganizerController,
} from "./organizer.controller";

import {
  OrganizerService,
} from "./organizer.service";

import {
  JwtAuthGuard,
} from "../auth/jwt-auth.guard";

import {
  RolesGuard,
} from "../common/authz/roles.guard";

@Module({
  imports: [JwtModule.register({})],
  controllers: [OrganizerController],
  providers: [
    OrganizerService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class OrganizerModule {}
