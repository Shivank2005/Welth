import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import AiChat from "@/components/ai-chat";

export default async function AssistantPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4.5rem)]">
      <AiChat />
    </div>
  );
}
