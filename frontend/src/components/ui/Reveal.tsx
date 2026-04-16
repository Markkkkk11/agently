"use client";

import { useReveal } from "@/lib/useReveal";

type Direction = "up" | "left" | "right" | "scale";

interface RevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

const transforms: Record<Direction, string> = {
  up: "translate3d(0, 50px, 0)",
  left: "translate3d(-50px, 0, 0)",
  right: "translate3d(50px, 0, 0)",
  scale: "scale(0.9)",
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>({ delay });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

interface RevealGroupProps {
  children: React.ReactNode;
  stagger?: number;
  direction?: Direction;
  className?: string;
}

export function RevealGroup({
  children,
  stagger = 120,
  direction = "up",
  className = "",
}: RevealGroupProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const items = Array.isArray(children) ? children : [children];

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className="h-full"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : transforms[direction],
            transition: `opacity 0.5s ease ${i * stagger}ms, transform 0.5s ease ${i * stagger}ms`,
            willChange: "opacity, transform",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
