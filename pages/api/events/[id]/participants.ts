import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { dbConnect } from "../../../../lib/mongodb";
import Participation from "../../../../models/Participation";
import Event from "../../../../models/Event";

type ResponseData =
  | { ok: true; participants: Array<{ _id: string; name: string; email: string }>; attendeesCount: number }
  | { ok: false; message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ ok: false, message: "Invalid event id" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, message: "Invalid ObjectId" });
  }

  await dbConnect();

  try {
    
    const event = await Event.findById(id).select("_id").lean();
    if (!event) {
      return res.status(404).json({ ok: false, message: "Event not found" });
    }

  
    const participations = await Participation.find({
      eventId: new mongoose.Types.ObjectId(id),
    })
      .populate("userId", "name email") 
      .lean();

    const participants = participations
      .map((p: any) => p.userId)
      .filter(Boolean)
      .map((u: any) => ({
        _id: String(u._id),
        name: u.name,
        email: u.email,
      }));

    return res.status(200).json({
      ok: true,
      participants,
      attendeesCount: participants.length,
    });
  } catch (err: any) {
    console.error("GET /api/events/[id]/participants error:", err);
    return res
      .status(500)
      .json({ ok: false, message: err?.message || "Server error" });
  }
}
