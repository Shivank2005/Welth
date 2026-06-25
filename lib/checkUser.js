import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma.js";

export async function checkUser() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    // 1. Check if user already exists in local database
    const localUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (localUser) {
      // User is already cached in local database!
      // Return details instantly without making a slow network call to Clerk.
      return {
        id: localUser.id,
        firstName: localUser.name ? localUser.name.split(" ")[0] : "there",
        imageUrl: localUser.imageUrl,
        email: localUser.email,
      };
    }

    // 2. First-time sign-in: Fetch full profile from Clerk over the network
    const user = await currentUser();
    if (!user) return null;

    await db.user.upsert({
      where: { id: user.id },
      update: {
        email: user.emailAddresses[0]?.emailAddress ?? null,
        name: user.fullName ?? user.firstName ?? null,
        imageUrl: user.imageUrl ?? null,
      },
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? null,
        name: user.fullName ?? user.firstName ?? null,
        imageUrl: user.imageUrl ?? null,
      },
    });

    const accountCount = await db.account.count({
      where: { userId: user.id },
    });

    if (accountCount === 0) {
      await db.account.create({
        data: {
          name: "Main Account",
          type: "CHECKING",
          userId: user.id,
          isDefault: true,
        },
      });
    }

    return {
      id: user.id,
      firstName: user.firstName ?? "there",
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress,
    };
  } catch (error) {
    console.error("checkUser database sync failed:", error);
    return null;
  }
}
