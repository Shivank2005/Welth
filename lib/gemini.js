import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

/**
 * Auto-categorize a transaction description using Groq (Llama 3).
 * Returns one of the valid category strings.
 */
export async function categorizeTransaction(description, type = "EXPENSE") {
  const expenseCategories = [
    "HOUSING", "FOOD", "TRANSPORT", "ENTERTAINMENT", 
    "HEALTH", "EDUCATION", "SHOPPING", "UTILITIES", "OTHER"
  ];
  const incomeCategories = ["SALARY", "FREELANCE", "INVESTMENT", "GIFT", "OTHER"];
  
  const categories = type === "INCOME" ? incomeCategories : expenseCategories;

  const prompt = `You are a financial transaction categorizer. Given the following transaction description, categorize it into exactly ONE of these categories: ${categories.join(", ")}.

Transaction description: "${description}"
Transaction type: ${type}

Respond with ONLY the category name in uppercase, nothing else. For example: FOOD`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });
    
    const response = chatCompletion.choices[0]?.message?.content?.trim().toUpperCase() || "OTHER";
    
    // Validate the response is a valid category
    if (categories.includes(response)) {
      return response;
    }
    return "OTHER";
  } catch (error) {
    console.error("AI categorization failed:", error);
    return "OTHER";
  }
}

/**
 * Extract receipt data from an image using Groq Vision (Llama 4 Scout).
 * Returns structured data: { amount, date, description, category }
 */
export async function scanReceipt(imageBase64, mimeType = "image/jpeg") {
  const prompt = `You are a receipt scanner. Analyze this receipt image and extract the following information. Respond in valid JSON format only, with no additional text:

{
  "amount": <the exact FINAL total amount paid from the receipt, including tax and tip, extracted as a float number (e.g., 42.50). Do not include currency symbols.>,
  "date": "<date in YYYY-MM-DD format, or today's date if not visible>",
  "description": "<the name of the merchant, store, or business>",
  "category": "<one of: HOUSING, FOOD, TRANSPORT, ENTERTAINMENT, HEALTH, EDUCATION, SHOPPING, UTILITIES, OTHER>"
}

If you cannot read the receipt clearly, make your best estimate. Always return valid JSON.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:${mimeType};base64,${imageBase64}` 
              } 
            }
          ]
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.1,
    });

    const text = chatCompletion.choices[0]?.message?.content?.trim() || "";
    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Receipt scanning failed:", error);
    return null;
  }
}

/**
 * Generate a financial insight or answer a question about user's finances using Groq (Llama 3).
 */
export async function askFinancialAssistant(messages, financialContext) {
  try {
    // Format the system instruction
    const systemInstruction = `You are Welth AI, a friendly and professional personal finance assistant. You help users understand their spending, budget, and financial health.
    
Here is the user's private financial data context:
${financialContext}

Provide a helpful, concise, and actionable response. Use specific numbers from their data when relevant. Keep your responses under 300 words. Use markdown to format tables, bold text, and bullet points perfectly.`;

    // Map conversation history to Groq's expected format
    const formattedMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("AI assistant failed:", error);
    return `I'm sorry, I encountered an error processing your question: ${error.message}`;
  }
}

/**
 * Generate monthly insights for the email report.
 */
export async function generateMonthlyInsights(income, expense, categoryBreakdown) {
  const prompt = `You are Welth AI, a financial advisor. 
I have the following data for a user's monthly spending:
Total Income: $${income.toFixed(2)}
Total Expenses: $${expense.toFixed(2)}
Expenses by Category: ${JSON.stringify(categoryBreakdown)}

Write 2-3 short, actionable bullet points analyzing this data. 
Focus on their net balance (income minus expense), their biggest spending categories, and give encouraging advice.
Return ONLY valid HTML <li> elements, nothing else. Do not wrap in <ul> or markdown blocks. Just the raw <li> tags.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });
    
    let html = chatCompletion.choices[0]?.message?.content?.trim() || "<li>Your finances look stable. Keep monitoring your expenses!</li>";
    // Strip markdown if the AI accidentally adds it
    html = html.replace(/```html/g, "").replace(/```/g, "");
    return html;
  } catch (error) {
    console.error("AI insight generation failed:", error);
    return "<li style='margin-bottom: 10px;'>Keep tracking your expenses to get deeper insights next month!</li>";
  }
}

export async function generateBudgetAlertInsights(category, spent, budget) {
  const prompt = `You are Welth AI, a financial advisor. 
The user has reached their budget limit for the category: ${category}.
Spent: $${spent.toFixed(2)}
Budget: $${budget.toFixed(2)}

Write 1 short, actionable paragraph offering advice on how to manage this budget overage for the rest of the month. Keep it encouraging and under 2 sentences. Do NOT use markdown.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });
    return chatCompletion.choices[0]?.message?.content?.trim() || "Consider pausing non-essential spending in this category until next month.";
  } catch (error) {
    console.error("AI insight generation failed:", error);
    return "Consider pausing non-essential spending in this category until next month.";
  }
}

export async function generateUnusualSpendInsights(category, amount, average) {
  const prompt = `You are Welth AI, a financial advisor. 
The user has an unusually large transaction in the category: ${category}.
Amount: $${amount.toFixed(2)}
Average spend in this category: $${average.toFixed(2)}

Write 1 short, actionable paragraph offering advice. Warn them to check for unauthorized access or forgotten subscriptions if they don't recognize it. Keep it under 2 sentences. Do NOT use markdown.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });
    return chatCompletion.choices[0]?.message?.content?.trim() || "Unexpected large charges could be a sign of unauthorized access or a forgotten subscription renewal.";
  } catch (error) {
    console.error("AI insight generation failed:", error);
    return "Unexpected large charges could be a sign of unauthorized access or a forgotten subscription renewal.";
  }
}

export async function generateLowBalanceInsights(accountName, projectedBalance, threshold) {
  const prompt = `You are Welth AI, a financial advisor. 
The user's account "${accountName}" is projected to drop below their safe threshold within 7 days based on upcoming expenses.
Projected Balance: $${projectedBalance.toFixed(2)}
Threshold: $${threshold.toFixed(2)}

Write 1 short, actionable paragraph offering advice. Prompt them to transfer funds to avoid overdraft fees. Keep it under 2 sentences. Do NOT use markdown.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });
    return chatCompletion.choices[0]?.message?.content?.trim() || "Avoid expensive overdraft fees. Log in to quickly transfer funds into this account or pause any upcoming scheduled payments.";
  } catch (error) {
    console.error("AI insight generation failed:", error);
    return "Avoid expensive overdraft fees. Log in to quickly transfer funds into this account or pause any upcoming scheduled payments.";
  }
}

export async function generateExpenseRatioInsights(income, expense, percentage) {
  const prompt = `You are Welth AI, a financial advisor. 
The user's total monthly expenses have reached ${percentage.toFixed(0)}% of their total monthly income.
Income: $${income.toFixed(2)}
Expenses: $${expense.toFixed(2)}

Write 1 short, actionable paragraph offering advice. If it's 80-95%, advise them to slow down spending. If it's 100% or over, advise them to stop non-essential spending immediately to avoid going into debt. Keep it under 2 sentences. Do NOT use markdown.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });
    return chatCompletion.choices[0]?.message?.content?.trim() || "Consider slowing down your spending to ensure you don't exceed your income for the month.";
  } catch (error) {
    console.error("AI insight generation failed:", error);
    return "Consider slowing down your spending to ensure you don't exceed your income for the month.";
  }
}
