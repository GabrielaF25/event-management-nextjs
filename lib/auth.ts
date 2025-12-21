import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

export async function requireSession(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return null;
  return session;
}

export function getUserFromSession(session: any) {
  const user = session.user as { id: string; role?: string; email?: string; name?: string };
  return user;
}

export function requireOrganizer(user: { role?: string }) {
  return user.role === "organizer";
}
