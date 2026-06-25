export default function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-3">
          About Us
        </p>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white md:text-5xl tracking-tight mb-8">
          Empowering your <span className="text-blue-600">financial freedom</span>
        </h2>
        
        <div className="prose prose-lg dark:prose-invert prose-blue mx-auto">
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            We believe that managing your personal finances should be effortless, intelligent, and completely secure. Welth was built to give everyone access to bank-grade financial insights without the complexity.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Our mission is to empower individuals to make smarter financial decisions through AI-driven insights and comprehensive tracking. We employ industry-leading encryption and partner with secure, read-only APIs to ensure your data is always safe.
          </p>
        </div>
      </div>
    </section>
  );
}
