import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "../../lib/mongodb"; // sau ../../lib/mongodb (după cum ai numit fișierul)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    return res.status(200).json({ ok: true, db: "connected" });
  } catch (err: any) {
    console.error("DB CONNECT ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: err?.message || "DB error",
      name: err?.name,
    });
  }
}
