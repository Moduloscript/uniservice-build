import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { earningsBackfillHandler } from "./earnings-backfill";

// Mock dependencies
vi.mock("@repo/database", () => ({
  db: {
    booking: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@repo/logs", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../../utils/earnings-helper", () => ({
  createEarningsFromCompletedBooking: vi.fn(),
}));

import { db } from "@repo/database";
import { createEarningsFromCompletedBooking } from "../../utils/earnings-helper";

describe("earningsBackfillHandler", () => {
  const app = new Hono();
  app.post("/backfill", earningsBackfillHandler);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully process bookings without earnings", async () => {
    // Mock database response
    const mockBookings = [
      { id: "booking-1", providerId: "provider-1", studentId: "student-1", scheduledFor: new Date() },
      { id: "booking-2", providerId: "provider-2", studentId: "student-2", scheduledFor: new Date() },
    ];

    (db.booking.findMany as any).mockResolvedValue(mockBookings);
    (createEarningsFromCompletedBooking as any).mockResolvedValue(undefined);

    const response = await app.request("/backfill", { method: "POST" });
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toContain("Processed 2 of 2 bookings");
    expect(responseData.summary.totalFound).toBe(2);
    expect(responseData.summary.processed).toBe(2);
    expect(responseData.summary.errors).toBe(0);
  });

  it("should handle case when no bookings need processing", async () => {
    (db.booking.findMany as any).mockResolvedValue([]);

    const response = await app.request("/backfill", { method: "POST" });
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.message).toContain("No completed bookings found");
    expect(responseData.summary.totalFound).toBe(0);
  });

  it("should handle partial failures gracefully", async () => {
    const mockBookings = [
      { id: "booking-1", providerId: "provider-1", studentId: "student-1", scheduledFor: new Date() },
      { id: "booking-2", providerId: "provider-2", studentId: "student-2", scheduledFor: new Date() },
    ];

    (db.booking.findMany as any).mockResolvedValue(mockBookings);
    (createEarningsFromCompletedBooking as any)
      .mockResolvedValueOnce(undefined) // First booking succeeds
      .mockRejectedValueOnce(new Error("Service price not found")); // Second booking fails

    const response = await app.request("/backfill", { method: "POST" });
    const responseData = await response.json();

    expect(response.status).toBe(207); // Multi-Status for partial success
    expect(responseData.summary.totalFound).toBe(2);
    expect(responseData.summary.processed).toBe(1);
    expect(responseData.summary.errors).toBe(1);
    expect(responseData.errors).toHaveLength(1);
    expect(responseData.errors[0].bookingId).toBe("booking-2");
  });

  it("should handle database query failures", async () => {
    (db.booking.findMany as any).mockRejectedValue(new Error("Database connection failed"));

    const response = await app.request("/backfill", { method: "POST" });
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.message).toContain("failed");
    expect(responseData.error).toContain("Database connection failed");
  });
});
