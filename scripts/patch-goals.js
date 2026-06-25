import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function patchGoals() {
  try {
    console.log("Fetching goals that need patching...");
    const goals = await prisma.goal.findMany();
    
    let patchedCount = 0;
    for (const goal of goals) {
      if (!goal.color) {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { color: "#3B82F6" } // Default blue color
        });
        patchedCount++;
      }
    }
    
    console.log(`Successfully patched ${patchedCount} goals with default colors.`);
  } catch (error) {
    console.error("Error patching goals:", error);
  } finally {
    await prisma.$disconnect();
  }
}

patchGoals();
