"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitContactForm } from "@/actions/contact";
import { Loader2 } from "lucide-react";

export default function ContactSection() {
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    const result = await submitContactForm(data);
    
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      alert(result.error || "Something went wrong.");
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-3">
          Contact Us
        </p>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-5xl tracking-tight mb-4">
          Get in touch
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
          Have questions about Welth? Fill out the form below and our team will get back to you shortly.
        </p>

        {status === "success" ? (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-8 text-center animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">Message Sent!</h3>
            <p className="text-emerald-600 dark:text-emerald-500">Thank you for reaching out. We will respond within 24 hours.</p>
            <Button 
              variant="outline" 
              className="mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-400"
              onClick={() => setStatus("idle")}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left bg-white dark:bg-slate-950 p-8 md:p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-gray-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input 
                  required
                  type="text" 
                  id="name" 
                  name="name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input 
                  required
                  type="email" 
                  id="email" 
                  name="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
              <textarea 
                required
                id="message" 
                name="message"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <Button 
              type="submit" 
              disabled={status === "submitting"}
              className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
