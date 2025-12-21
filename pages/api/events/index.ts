import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../../../lib/mongodb";
import Event from "../../../models/Event";
import { requireSession, getUserFromSession, requireOrganizer } from "../../../lib/auth";

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
      const events = await Event.find().sort({ date: 1 });
      return res.status(200).json({ ok: true, events });
    } catch (err: any) {
      return res
        .status(500)
        .json({ ok: false, message: err?.message || "Server error" });
    }
  }

  // =====================
  // POST /api/events (TEMPORAR fără auth)
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
      const { title, description, date, location, category } = req.body;

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
        organizerId: user.id, // îl completăm DUPĂ auth
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
