import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { dbConnect } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import Participation from "../../../../models/Participation";
import { requireSession, getUserFromSession } from "../../../../lib/auth";

type ResponseData =
  | { ok: true; message: string; attendeesCount: number }
  | { ok: false; message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ ok: false, message: "Invalid id" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, message: "Invalid ObjectId" });
  }

  // ✅ Auth FIRST
  const session = await requireSession(req, res);
  if (!session) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const user = getUserFromSession(session);
  const userId = user.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json({ ok: false, message: "Invalid session user" });
  }

  await dbConnect();

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ ok: false, message: "Event not found" });
    }
    if (event.isCanceled) {
      return res.status(400).json({ ok: false, message: "Event is canceled" });
    }

    // Creează participarea (indexul unique previne dublarea)
    try {
      await Participation.create({
        eventId: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
        status: "going",
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        return res.status(409).json({
          ok: false,
          message: "You already confirmed participation",
        });
      }
      throw err;
    }

    const attendeesCount = await Participation.countDocuments({
      eventId: new mongoose.Types.ObjectId(id),
    });

    return res.status(200).json({
      ok: true,
      message: "Participation confirmed",
      attendeesCount,
    });
  } catch (err: any) {
    console.error("POST /api/events/[id]/attend error:", err);
    return res
      .status(500)
      .json({ ok: false, message: err?.message || "Server error" });
  }
}
