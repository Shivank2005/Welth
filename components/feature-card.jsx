"use client";

export default function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <div
      className="group relative rounded-2xl border border-blue-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-white shadow-md shadow-blue-200 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}
