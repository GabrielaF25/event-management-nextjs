import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../../../lib/mongodb";
import Event from "../../../models/Event";
import { requireSession, getUserFromSession, requireOrganizer } from "../../../lib/auth";
import Participation from "../../../models/Participation";
import mongoose from "mongoose";


type ResponseData =
  | { ok: true; events?: any[]; event?: any }
  | { ok: false; message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  await dbConnect();

  // =====================
  // GET /api/events
  // =====================
if (req.method === "GET") {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();

    const eventIds = events.map((e: any) => new mongoose.Types.ObjectId(e._id));

    const counts = await Participation.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>(
      counts.map((c: any) => [String(c._id), c.count])
    );

    const eventsWithCounts = events.map((e: any) => ({
      ...e,
      attendeesCount: countMap.get(String(e._id)) || 0,
    }));

    return res.status(200).json({ ok: true, events: eventsWithCounts });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, message: err?.message || "Server error" });
  }
}

  // =====================
  // POST /api/events
  // =====================
  if (req.method === "POST") {
        const session = await requireSession(req, res);
    if (!session) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const user = getUserFromSession(session);
    if (!requireOrganizer(user)) {
      return res
        .status(403)
        .json({ ok: false, message: "Only organizers can create events" });
    }
    try {
      const { title, description, date, location, category, price, capacity, imageUrl } = req.body;


      if (!title || !description || !date || !location) {
        return res.status(400).json({
          ok: false,
          message: "Title, description, date and location are required",
        });
      }

      const event = await Event.create({
  title,
  description,
  date: new Date(date),
  location,
  category,
  price: Number(price) || 0,
  capacity: Number(capacity) || 0,
  imageUrl: imageUrl || "",
  organizerId: user.id,
});

      return res.status(201).json({ ok: true, event });
    } catch (err: any) {
      return res
        .status(500)
        .json({ ok: false, message: err?.message || "Server error" });
    }
  }

  return res.status(405).json({ ok: false, message: "Method Not Allowed" });
}
