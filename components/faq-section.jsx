import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How secure is my financial data?",
    answer: "Welth uses bank-grade 256-bit AES encryption. We do not store your bank credentials. All data is handled through secure, read-only APIs like Plaid and the RBI Account Aggregator network.",
  },
  {
    question: "Which banks are supported?",
    answer: "We support over 11,000 institutions globally via Plaid (Chase, Bank of America, Wells Fargo) and all major Indian banks (HDFC, SBI, ICICI, Axis) via the Setu Account Aggregator framework.",
  },
  {
    question: "How does the AI categorization work?",
    answer: "Every transaction is securely processed by our Llama 3 / Gemini AI models. The AI analyzes the transaction description and automatically assigns it to categories like 'Food', 'Transport', or 'Entertainment' with 99% accuracy.",
  },
  {
    question: "Is Welth free to use?",
    answer: "Yes! Welth is completely free for individual users to track up to 3 bank accounts. We offer a premium plan for unlimited accounts and advanced custom reporting.",
  }
];

export default function FaqSection() {
  return (
    <div className="w-full relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Frequently <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">asked questions</span>
        </h2>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Everything you need to know about Welth.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4 relative z-10">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`} 
            className="border border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl px-6 py-2 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 data-[state=open]:border-blue-200 dark:data-[state=open]:border-blue-800"
          >
            <AccordionTrigger className="text-left font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 text-lg hover:no-underline [&[data-state=open]]:text-blue-600 dark:[&[data-state=open]]:text-blue-400">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-blue-500/70" />
                {faq.question}
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-500 dark:text-gray-400 text-base leading-relaxed pl-8 pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
