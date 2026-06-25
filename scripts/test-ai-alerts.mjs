import { processAlerts } from './lib/alerts.js';
import { db } from './lib/prisma.js';
const prisma = new PrismaClient();

async function testAiAlerts() {
  try {
    console.log("Triggering AI Alerts manually for testing...");
    const users = await db.user.findMany({ select: { id: true } });
    
    for (const user of users) {
      console.log(`Processing alerts for user ${user.id}...`);
      await processAlerts(user.id);
    }
    
    console.log("AI Alerts test complete!");
  } catch (error) {
    console.error("AI Alerts test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAiAlerts();
