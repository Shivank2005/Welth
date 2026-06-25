"use client";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export default function AnimatedCounter({ targetValue, suffix = "", prefix = "", isFloat = false }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const duration = 1500; // ms
      const startTime = performance.now();
      
      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutQuart easing function
        const easeOut = 1 - Math.pow(1 - progress, 4);
        
        const currentCount = targetValue * easeOut;
        
        if (isFloat) {
          setCount(currentCount.toFixed(1));
        } else {
          setCount(Math.floor(currentCount));
        }
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          if (isFloat) {
            setCount(targetValue.toFixed(1));
          } else {
            setCount(targetValue);
          }
        }
      };
      
      requestAnimationFrame(updateCount);
    }
  }, [isInView, targetValue, isFloat]);

  // Format the number with commas if it's an integer
  const displayCount = typeof count === 'number' && !isFloat 
    ? count.toLocaleString() 
    : count;

  return <span ref={ref}>{prefix}{displayCount}{suffix}</span>;
}
