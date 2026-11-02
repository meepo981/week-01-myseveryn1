-- CreateTable
CREATE TABLE "Venue" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "venue_id" UUID NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "row" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Venue_city_idx" ON "Venue"("city");

-- CreateIndex
CREATE INDEX "Event_starts_at_id_idx" ON "Event"("starts_at", "id");

-- CreateIndex
CREATE INDEX "Event_venue_id_idx" ON "Event"("venue_id");

-- CreateIndex
CREATE INDEX "Seat_event_id_idx" ON "Seat"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_event_id_row_number_key" ON "Seat"("event_id", "row", "number");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
