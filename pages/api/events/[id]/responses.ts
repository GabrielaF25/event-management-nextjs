import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { dbConnect } from "../../../../lib/mongodb";
import Participation from "../../../../models/Participation";
import Event from "../../../../models/Event";

type ResponseData =
  | { ok: true; events: any[] }
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
    return res.status(400).json({ ok: false, message: "Invalid user id" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ ok: false, message: "Invalid ObjectId" });
  }

  await dbConnect();

  try {
    // 1) găsim participările user-ului
    const participations = await Participation.find({
      userId: new mongoose.Types.ObjectId(id),
    })
      .select("eventId")
      .lean();

    const eventIds = participations.map((p) => p.eventId);

    if (eventIds.length === 0) {
      return res.status(200).json({ ok: true, events: [] });
    }

    // 2) aducem evenimentele la care a participat
    const events = await Event.find({ _id: { $in: eventIds } })
      .sort({ date: 1 })
      .lean();

    return res.status(200).json({ ok: true, events });
  } catch (err: any) {
    console.error("GET /api/users/[id]/responses error:", err);
    return res
      .status(500)
      .json({ ok: false, message: err?.message || "Server error" });
  }
}
