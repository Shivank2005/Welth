import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testScan() {
  console.log("Testing Receipt Scanner functionality...");
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this receipt image and extract the following information in JSON format:
    - amount: (number)
    - date: (Date)
    - description: (string)
    - merchantName: (string)
    - category: (string)
  `;

  console.log("Mocking a receipt scan using Gemini...");
  try {
    const result = await model.generateContent(prompt + "\\n[Pretend I uploaded an image of a $45 Starbucks receipt here]");
    const response = await result.response;
    const text = response.text();
    console.log("Scan Result JSON:");
    console.log(text);
    console.log("✅ Scan test complete!");
  } catch (error) {
    console.error("❌ Error running scan test:", error);
  }
}

testScan();
