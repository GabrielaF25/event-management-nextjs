import { describe, it, expect, vi } from "vitest";
import { runApi } from "./helpers/runApi";
import handler from "../pages/api/events/index";

// mock dbConnect
vi.mock("../lib/mongodb", () => ({
  dbConnect: async () => true,
}));

// mock Event model
vi.mock("../models/Event", () => ({
  default: {
    find: () => ({
      sort: () => ({
        // dacă în handler-ul tău NU folosește lean(), schimbă asta în sort: async () => [...]
        lean: async () => [
  { _id: "507f191e810c19729de860ea", title: "Event 1", capacity: 100, date: new Date() },
  { _id: "507f191e810c19729de860eb", title: "Event 2", capacity: 0, date: new Date() },
],
      }),
    }),
  },
}));


vi.mock("../models/Participation", () => ({
  default: {
    aggregate: async () => [
  { _id: "507f191e810c19729de860ea", count: 10 },
  { _id: "507f191e810c19729de860eb", count: 0 },
],
  },
}));

// mock auth helpers (nu sunt folosite la GET, dar importul există în handler)
vi.mock("../lib/auth", () => ({
  requireSession: vi.fn(),
  getUserFromSession: vi.fn(),
  requireOrganizer: vi.fn(),
}));

describe("GET /api/events", () => {
  it("returns events list", async () => {
    const res = await runApi(handler, { method: "GET" });
    console.log("STATUS:", res.statusCode);
console.log("JSON:", res.json);


    expect(res.statusCode).toBe(200);
    expect(res.json.ok).toBe(true);
    expect(Array.isArray(res.json.events)).toBe(true);
  });
});
