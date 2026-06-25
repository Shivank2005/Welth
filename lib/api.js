import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function getUserIdOrUnauthorized() {
  const userId = await getAuthUserId();
  if (!userId) return null;
  return userId;
}
