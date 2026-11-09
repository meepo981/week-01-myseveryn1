
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { Role } from "@prisma/client";
import { z } from "zod";

import {
  JwtAuthGuard,
  type AuthUser,
} from "../auth/jwt-auth.guard";

import {
  CurrentUser,
} from "../auth/current-user.decorator";

import { Roles } from "../common/authz/roles.decorator";
import { RolesGuard } from "../common/authz/roles.guard";

import {
  OrganizerService,
} from "./organizer.service";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  startsAt: z.string().datetime({ offset: true }),
  venueId: z.string().uuid(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
}).refine(
  (body) => Object.keys(body).length > 0,
  { message: "Потрібно вказати хоча б одне поле" }
);

@Controller("organizer/events")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ORGANIZER, Role.ADMIN)
export class OrganizerController {
  constructor(
    private readonly organizer: OrganizerService
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.organizer.list(user);
  }

  @Post()
  @HttpCode(201)
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: unknown
  ) {
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException("Некоректні дані");
    }

    return this.organizer.create(user, parsed.data);
  }

  @Patch(":eventId")
  update(
    @CurrentUser() user: AuthUser,
    @Param("eventId") eventId: string,
    @Body() body: unknown
  ) {
    const id = z.string().uuid().safeParse(eventId);
    const parsed = updateSchema.safeParse(body);

    if (!id.success || !parsed.success) {
      throw new BadRequestException("Некоректні дані");
    }

    return this.organizer.update(
      user,
      id.data,
      parsed.data
    );
  }
}
