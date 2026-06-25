"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function HeroImage() {
  const ref = useRef(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = -(e.clientY - top - height / 2) / 25;
    setTransform(`perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div 
      className="mt-16 hero-fade-in-delayed relative mx-auto max-w-6xl transition-transform duration-200 ease-out"
      style={{ transform, transformStyle: "preserve-3d" }}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-t-3xl border-x border-t border-gray-200 bg-white shadow-2xl shadow-blue-900/10">
        <Image
          src="/hero.png"
          alt="Welth AI finance dashboard"
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>
      {/* Gradient fade at bottom to blend into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50/80 to-transparent pointer-events-none" />
    </div>
  );
}
