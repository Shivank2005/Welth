import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AiAssistantFab from "@/components/ai-assistant-fab";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Welth - Premium Personal Finance AI",
  description: "Track your spending, set intelligent budgets, and manage your wealth with an AI-powered financial assistant.",
  keywords: "finance, wealth management, budget tracker, AI financial assistant, expense tracking",
  openGraph: {
    title: "Welth - Premium Personal Finance AI",
    description: "Track your spending, set intelligent budgets, and manage your wealth with an AI-powered financial assistant.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} `}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen pt-[4.5rem]">{children}</main>
            <Footer />
            <AiAssistantFab />
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
