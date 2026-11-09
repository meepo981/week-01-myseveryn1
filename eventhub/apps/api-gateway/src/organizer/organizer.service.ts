
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";

import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

import type { AuthUser } from "../auth/jwt-auth.guard";

export type CreateEventBody = {
  title: string;
  description?: string;
  startsAt: string;
  venueId: string;
};

export type UpdateEventBody = {
  title?: string;
  description?: string;
  startsAt?: string;
};

@Injectable()
export class OrganizerService {
  constructor(private readonly prisma: PrismaService) {}

  private scopeFor(
    user: AuthUser
  ): Prisma.EventWhereInput {
    return user.role === Role.ADMIN
      ? {}
      : { organizerId: user.id };
  }

  async list(user: AuthUser) {
    return this.prisma.event.findMany({
      where: this.scopeFor(user),
      include: { venue: true },
      orderBy: [
        { startsAt: "asc" },
        { id: "asc" },
      ],
    });
  }

  async create(user: AuthUser, body: CreateEventBody) {
    const venue = await this.prisma.venue.findUnique({
      where: { id: body.venueId },
    });

    if (!venue) {
      throw new UnprocessableEntityException(
        "Майданчик не знайдено"
      );
    }

    return this.prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startsAt: new Date(body.startsAt),
        venueId: body.venueId,
        organizerId: user.id,
      },
      include: { venue: true },
    });
  }

  async update(
    user: AuthUser,
    eventId: string,
    body: UpdateEventBody
  ) {
    const result = await this.prisma.event.updateMany({
      where: {
        id: eventId,
        ...this.scopeFor(user),
      },
      data: {
        ...(body.title !== undefined
          ? { title: body.title }
          : {}),
        ...(body.description !== undefined
          ? { description: body.description }
          : {}),
        ...(body.startsAt !== undefined
          ? { startsAt: new Date(body.startsAt) }
          : {}),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException("Подію не знайдено");
    }

    return this.prisma.event.findFirst({
      where: {
        id: eventId,
        ...this.scopeFor(user),
      },
      include: { venue: true },
    });
  }
}
