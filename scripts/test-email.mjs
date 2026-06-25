import { sendContactEmail } from './lib/email.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("Testing email functionality...");
  try {
    const res = await sendContactEmail({ name: "Test User", email: "test@example.com", message: "This is a test email script" });
    console.log("Email test result:", res);
  } catch (e) {
    console.error(e);
  }
}
run();
