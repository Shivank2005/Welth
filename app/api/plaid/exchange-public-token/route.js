import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publicToken, accountId } = await req.json();

    if (!publicToken || !accountId) {
      return NextResponse.json(
        { error: "Public token and account ID are required" },
        { status: 400 }
      );
    }

    // Exchange the public token for an access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Save the access token to the specific account
    await db.account.update({
      where: { id: accountId },
      data: {
        plaidAccessToken: accessToken,
        plaidItemId: itemId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error exchanging Plaid public token:", error);
    return NextResponse.json(
      { error: "Failed to exchange public token" },
      { status: 500 }
    );
  }
}
