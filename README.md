# Welth - AI-Powered Personal Finance & Wealth Management

**Welth** is a premium, full-stack personal finance application designed to help users track spending, manage budgets, and generate intelligent financial insights using AI. Built as a showcase of modern web development and AI integration.

![Dashboard Preview](/public/logo.png) *Replace with a real screenshot of the dashboard*

## 🚀 Key Features

- **Automated Monthly Reports**: A Vercel Cron Job automatically compiles your monthly spending data and uses Gemini to email you a beautifully formatted, AI-driven financial report on the 1st of every month.
- **Real-Time Alerting System**: Instant email notifications (powered by Resend & Nodemailer) when you exceed your category budgets or experience unusual spending spikes.
- **AI Receipt Scanning**: Instantly extract amounts, merchants, and dates from uploaded receipt images using advanced Llama Vision models.
- **Multi-Currency Support**: Add accounts and track transactions in over 150+ global currencies. The dashboard dynamically converts all balances and metrics into your chosen base currency using live exchange rates.
- **AI Financial Assistant**: Powered by Google Gemini (or Llama3 via Groq), the AI analyzes your spending habits, predicts future expenses, and gives you personalized, actionable financial advice.
- **Intelligent Budgeting**: Set dynamic budgets for various categories and visually track your progress.
- **Dark Mode & Premium UI**: A highly polished, responsive interface built with Tailwind CSS, Shadcn UI, and smooth glass-morphism effects.
- **Secure Authentication**: Enterprise-grade security and user management powered by Clerk.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions)
- **Database**: PostgreSQL (via Supabase / Neon)
- **ORM**: Prisma
- **Authentication**: Clerk
- **AI Engine**: Google Gemini API / Groq
- **Styling**: Tailwind CSS & Shadcn UI
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm/yarn installed.

### Environment Variables
Create a `.env.local` file in the root of your project and add the following keys:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database Connection (Supabase/Neon)
DATABASE_URL="your_postgresql_database_url"
DIRECT_URL="your_postgresql_direct_url"

# AI Integration
GEMINI_API_KEY="your_gemini_api_key"
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shivank2005/Welth.git
   cd Welth
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app running!

## 🧪 Demo Data

For recruiters or portfolio reviewers: You can instantly populate the application with realistic financial data to see the charts and AI in action.
1. Create an account and log in.
2. Navigate to **Settings**.
3. Click the **Generate Demo Data** button under the "Data & Privacy" section.

---
*Developed by Shivank*
