"use server";

import { sendContactEmail } from "@/lib/email";

export async function submitContactForm(data) {
  const { name, email, message } = data;
  
  if (!name || !email || !message) {
    return { success: false, error: "All fields are required" };
  }

  const result = await sendContactEmail({ name, email, message });
  
  if (result) {
    return { success: true };
  } else {
    return { success: false, error: "Failed to send email. Please try again." };
  }
}
