import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Fetching available models...");
    
    // We do a simple test by calling the gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you online?");
    const response = await result.response;
    const text = response.text();
    
    console.log("Model response: ", text);
    console.log("✅ Model connection successful!");
  } catch (error) {
    console.error("❌ Error testing models:", error);
  }
}

testModels();
