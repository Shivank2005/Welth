import { auth } from "@clerk/nextjs/server";

export async function getAuthUserId() {
  const { userId } = await auth();
  return userId;
}

export async function requireAuthUserId() {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
