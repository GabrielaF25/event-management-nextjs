import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { dbConnect } from "../../lib/mongodb";
import User from "../../models/User";

type ResponseData =
  | { ok: true; message: string }
  | { ok: false; message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "name, email, password are required" });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res
      .status(400)
      .json({ ok: false, message: "password must be at least 6 characters" });
  }

  await dbConnect();

  const normalizedEmail = String(email).toLowerCase().trim();

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    return res.status(409).json({ ok: false, message: "Email already used" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role: role === "organizer" ? "organizer" : "attendee",
  });

  return res.status(201).json({ ok: true, message: "User created" });
}
