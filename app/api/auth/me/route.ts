import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

export async function GET() {
  const token = cookies().get("djavu_token")?.value;
  if (!token) return NextResponse.json({ user: null });

  const payload = verifyAuthToken(token);
  if (!payload) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
  });
}
