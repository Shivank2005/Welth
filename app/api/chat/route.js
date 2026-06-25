import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { getFinancialContext } from "@/actions/ai";
import { askFinancialAssistant } from "@/lib/gemini";

export async function POST(req) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Message history is required" }, { status: 400 });
    }

    // Get the user's financial data as context
    const financialContext = await getFinancialContext();

    // Ask Gemini with full conversation history
    const response = await askFinancialAssistant(messages, financialContext);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    );
  }
}
