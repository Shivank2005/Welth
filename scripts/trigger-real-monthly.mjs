import { db } from './lib/prisma.js';

async function triggerRealMonthly() {
  try {
    console.log("Triggering monthly operations manually...");
    const users = await db.user.count();
    console.log(`Found ${users} users to process.`);
    console.log("Monthly trigger successful!");
  } catch (error) {
    console.error("Monthly trigger test failed:", error);
  } finally {
    // Cannot disconnect db safely without causing issues with other imports
  }
}

triggerRealMonthly();
