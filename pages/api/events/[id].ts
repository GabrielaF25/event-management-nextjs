import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { dbConnect } from "../../../lib/mongodb";
import Event from "../../../models/Event";
import { requireSession, getUserFromSession, requireOrganizer } from "../../../lib/auth";
import Participation from "../../../models/Participation";

type ResponseData =
  | { ok: true; event?: any; attendeesCount?: number; deleted?: true }
  | { ok: false; message: string };

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ ok: false, message: "Invalid id" });
  }

  if (!isValidObjectId(id)) {
    return res.status(400).json({ ok: false, message: "Invalid ObjectId" });
  }

  await dbConnect();

  // =====================
  // GET /api/events/:id
  // =====================
  if (req.method === "GET") {
    try {
      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({ ok: false, message: "Event not found" });
      }

      const attendeesCount = await Participation.countDocuments({
        eventId: new mongoose.Types.ObjectId(id),
      });

      return res.status(200).json({ ok: true, event, attendeesCount });
    } catch (err: any) {
      console.error("GET /api/events/[id] error:", err);
      return res
        .status(500)
        .json({ ok: false, message: err?.message || "Server error" });
    }
  }

  // =====================
  // PUT /api/events/:id
  // =====================
  if (req.method === "PUT") {
    const session = await requireSession(req, res);
if (!session) return res.status(401).json({ ok: false, message: "Unauthorized" });

const user = getUserFromSession(session);
if (!requireOrganizer(user)) {
  return res.status(403).json({ ok: false, message: "Only organizers can edit/delete events" });
}

const event = await Event.findById(id);
if (!event) return res.status(404).json({ ok: false, message: "Event not found" });

// doar organizer-ul eventului are voie
if (String(event.organizerId) !== String(user.id)) {
  return res.status(403).json({ ok: false, message: "Not allowed for this event" });
}

    try {
      const { title, description, date, location, category, isCanceled } =
        req.body;

      // Validări: required fields (dacă user vrea să le editeze)
      // Dacă vrei update parțial, poți scoate această verificare.
      if (!title || !description || !date || !location) {
        return res.status(400).json({
          ok: false,
          message: "Title, description, date and location are required",
        });
      }

      const updated = await Event.findByIdAndUpdate(
        id,
        {
          title,
          description,
          date: new Date(date),
          location,
          category,
          isCanceled: Boolean(isCanceled),
        },
        { new: true, runValidators: true } // runValidators = respectă maxlength/required din model
      );

      if (!updated) {
        return res.status(404).json({ ok: false, message: "Event not found" });
      }

      return res.status(200).json({ ok: true, event: updated });
    } catch (err: any) {
      console.error("PUT /api/events/[id] error:", err);
      return res
        .status(500)
        .json({ ok: false, message: err?.message || "Server error" });
    }
  }

  // =====================
  // DELETE /api/events/:id
  // =====================
  if (req.method === "DELETE") {
    const session = await requireSession(req, res);
if (!session) return res.status(401).json({ ok: false, message: "Unauthorized" });

const user = getUserFromSession(session);
if (!requireOrganizer(user)) {
  return res.status(403).json({ ok: false, message: "Only organizers can edit/delete events" });
}

const event = await Event.findById(id);
if (!event) return res.status(404).json({ ok: false, message: "Event not found" });

// doar organizer-ul eventului are voie
if (String(event.organizerId) !== String(user.id)) {
  return res.status(403).json({ ok: false, message: "Not allowed for this event" });
}

    try {
      // ștergem eventul
      const deletedEvent = await Event.findByIdAndDelete(id);

      if (!deletedEvent) {
        return res.status(404).json({ ok: false, message: "Event not found" });
      }

      // ștergem și participările asociate (curățenie)
      await Participation.deleteMany({ eventId: deletedEvent._id });

      return res.status(200).json({ ok: true, deleted: true });
    } catch (err: any) {
      console.error("DELETE /api/events/[id] error:", err);
      return res
        .status(500)
        .json({ ok: false, message: err?.message || "Server error" });
    }
  }

  return res.status(405).json({ ok: false, message: "Method Not Allowed" });
}
