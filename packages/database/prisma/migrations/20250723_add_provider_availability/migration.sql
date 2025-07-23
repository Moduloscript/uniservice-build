-- Migration: Add provider_availability table for real booking calendar

-- Create provider_availability table
CREATE TABLE "provider_availability" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceId" TEXT,
    "date" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "maxBookings" INTEGER NOT NULL DEFAULT 1,
    "currentBookings" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_availability_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE INDEX "provider_availability_providerId_idx" ON "provider_availability"("providerId");
CREATE INDEX "provider_availability_serviceId_idx" ON "provider_availability"("serviceId");
CREATE INDEX "provider_availability_date_idx" ON "provider_availability"("date");
CREATE INDEX "provider_availability_date_providerId_idx" ON "provider_availability"("date", "providerId");

-- Create unique constraint to prevent double bookings
CREATE UNIQUE INDEX "provider_availability_providerId_date_startTime_key" ON "provider_availability"("providerId", "date", "startTime");

-- Add foreign key constraints
ALTER TABLE "provider_availability" ADD CONSTRAINT "provider_availability_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_availability" ADD CONSTRAINT "provider_availability_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
