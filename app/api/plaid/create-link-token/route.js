import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { checkUser } from "@/lib/checkUser";

export async function POST() {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = {
      user: {
        client_user_id: user.id,
      },
      client_name: "Welth AI",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    };

    const response = await plaidClient.linkTokenCreate(request);
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error creating Plaid link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
