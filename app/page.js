import Image from "next/image";
import Link from "next/link";
import HeroImage from "@/components/hero-image";
import HeroActions from "@/components/hero-actions";
import AnimatedSection from "@/components/animated-section";
import AnimatedCounter from "@/components/animated-counter";
import FloatingElements from "@/components/floating-elements";

import SavingsCalculator from "@/components/savings-calculator";
import FaqSection from "@/components/faq-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import {
  BarChart3,
  Shield,
  Wallet,
  TrendingUp,
  PieChart,
  CreditCard,
  BellRing,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Lock,
  EyeOff,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background">
      {/* ───── Hero Section ───── */}
      <section className="relative overflow-hidden pt-12 pb-0 md:pt-16">
        <FloatingElements />
        {/* Gradient background blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-purple-400/20 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-400/10 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-5xl space-y-8 hero-fade-in">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.1]">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Manage Your Finances
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                with Intelligence
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl font-medium">
              An AI-powered financial management platform that helps you track, analyze, and optimize your spending with real-time insights.
            </p>

            <HeroActions />
          </div>

          <HeroImage />
        </div>
      </section>

      {/* ───── Trusted-by Banner ───── */}
      <AnimatedSection className="border-t bg-gray-50/80 pt-10" delay={0.1}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
            Trusted by employees at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
            {/* Using simple text placeholders that look like company names for the banner */}
            <span className="text-xl font-bold tracking-tight text-gray-800">ACME Corp</span>
            <span className="text-xl font-bold tracking-tight text-gray-800">Global Tech</span>
            <span className="text-xl font-bold tracking-tight text-gray-800">Stark Ind.</span>
            <span className="text-xl font-bold tracking-tight text-gray-800">Wayne Ent.</span>
            <span className="text-xl font-bold tracking-tight text-gray-800">Initech</span>
          </div>
        </div>
      </AnimatedSection>

      {/* ───── Stats Strip ───── */}
      <AnimatedSection className="border-b bg-gray-50/80 py-10" delay={0.2}>
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {[
            { targetValue: 24, suffix: "Cr+", prefix: "₹", label: "Transactions Tracked", isFloat: false },
            { targetValue: 2400, suffix: "+", prefix: "", label: "Active Users", isFloat: false },
            { targetValue: 99.9, suffix: "%", prefix: "", label: "Uptime", isFloat: true },
            { targetValue: 4.9, suffix: "★", prefix: "", label: "User Rating", isFloat: true },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                <AnimatedCounter 
                  targetValue={stat.targetValue} 
                  suffix={stat.suffix} 
                  prefix={stat.prefix} 
                  isFloat={stat.isFloat} 
                />
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ───── About Section ───── */}
      <AnimatedSection delay={0.2}>
        <AboutSection />
      </AnimatedSection>

      {/* ───── Features Grid ───── */}
      <AnimatedSection className="py-20 md:py-28" delay={0.1}>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Everything you need to manage money
            </h2>
            <p className="mt-4 text-gray-500">
              From expense tracking to AI-powered insights, Welth gives you
              the complete picture of your finances.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Wallet,
                title: "Smart Transaction Tracking",
                desc: "Automatically categorise income & expenses and see where every rupee goes.",
                span: "sm:col-span-2 lg:col-span-2",
              },
              {
                icon: BarChart3,
                title: "Visual Insights",
                desc: "Interactive charts that make data intuitive.",
                span: "col-span-1",
              },
              {
                icon: PieChart,
                title: "Budget Planning",
                desc: "Set monthly budgets per category and get real-time alerts.",
                span: "col-span-1",
              },
              {
                icon: BellRing,
                title: "Smart Alerts",
                desc: "Receive notifications for unusual spending, recurring charges, and bill reminders.",
                span: "sm:col-span-2 lg:col-span-2",
              },
              {
                icon: CreditCard,
                title: "Multi-Account Support",
                desc: "Link bank accounts, credit cards, and wallets — view everything in one place.",
                span: "sm:col-span-2 lg:col-span-2",
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                desc: "End-to-end encryption keeps your financial data safe.",
                span: "col-span-1",
              },
            ].map((feat, i) => (
              <div
                key={feat.title}
                className={`group relative rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 ${feat.span}`}
              >
                <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white shadow-lg shadow-blue-200 transition-transform duration-300 group-hover:scale-110">
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  {feat.title}
                </h3>
                <p className="text-base leading-relaxed text-gray-500">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24">
            <SavingsCalculator />
          </div>
        </div>
      </AnimatedSection>

      {/* ───── How It Works ───── */}
      <AnimatedSection className="relative overflow-hidden bg-gray-50 py-20 md:py-28" delay={0.2}>
        <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-200/30 blur-[100px]" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up in seconds with Clerk — no lengthy forms, just secure authentication.",
              },
              {
                step: "02",
                title: "Add Your Accounts",
                desc: "Add your bank accounts, wallets, and cards so Welth can track every transaction.",
              },
              {
                step: "03",
                title: "Get Insights Instantly",
                desc: "Your dashboard lights up with charts, budgets, and AI recommendations tailored to you.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center md:text-left">
                <span className="text-6xl font-extrabold text-blue-100">
                  {item.step}
                </span>
                <h3 className="-mt-4 text-xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ───── Testimonials ───── */}
      <AnimatedSection className="py-20 md:py-28" delay={0.2}>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Testimonials
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
              Loved by thousands of users
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Priya Sharma",
                role: "Freelance Designer",
                text: "Welth completely changed how I look at my finances. The charts are gorgeous and the budget alerts have saved me so many times!",
              },
              {
                name: "Rahul Mehta",
                role: "Software Engineer",
                text: "I've tried five finance apps and nothing comes close. The multi-account view and spending breakdown are incredibly useful.",
              },
              {
                name: "Ananya Patel",
                role: "Business Owner",
                text: "Setting up took literally 2 minutes. Now I track both personal and business expenses from one dashboard. Highly recommend!",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
      {/* ───── FAQ Section ───── */}
      <AnimatedSection className="bg-gray-50 dark:bg-slate-900/50 py-20 md:py-28" delay={0.2}>
        <div className="container mx-auto px-4">
          <FaqSection />
        </div>
      </AnimatedSection>

      {/* ───── Contact Section ───── */}
      <AnimatedSection delay={0.2}>
        <ContactSection />
      </AnimatedSection>

      {/* ───── CTA Section ───── */}
      <AnimatedSection className="relative z-0 overflow-hidden bg-transparent py-24 md:py-32" delay={0.1}>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-6xl lg:text-7xl">
            Ready to take control <br className="hidden sm:block" /> of your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">financial future?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 dark:text-slate-400 md:text-xl">
            Join thousands of users who are already saving more, spending
            smarter, and building wealth — for free.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <button className="group relative flex h-14 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-base font-bold text-white transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-[0_0_40px_8px_rgba(37,99,235,0.2)]">
                Get Started for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
              <Shield className="h-3 w-3" /> Bank-level Security
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
              <Lock className="h-3 w-3" /> 256-bit Encryption
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full dark:bg-slate-800 dark:text-slate-400">
              <EyeOff className="h-3 w-3" /> Read-Only Access
            </span>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm font-medium text-slate-500 dark:text-slate-400">
            {["No credit card required", "Free forever plan", "Setup in 2 minutes"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
