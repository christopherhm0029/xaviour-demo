"use client";

import { useEffect, useRef, useState } from "react";

interface GreetingLineProps {
  name: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  const now = new Date();
  const day = now.toLocaleDateString("en-GB", { weekday: "long" });
  const date = now.getDate();
  const month = now.toLocaleDateString("en-GB", { month: "long" });
  return `${day}, ${date} ${month}`;
}

export function GreetingLine({ name }: GreetingLineProps) {
  const greeting = getGreeting();
  const fullText = `${greeting}, ${name}.`;
  const nameStartIndex = greeting.length + 2;
  const [revealed, setRevealed] = useState(false);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (revealed) return;
    setRevealed(true);

    const chars = charsRef.current;
    chars.forEach((el, i) => {
      if (!el) return;
      const isNamePart = i >= nameStartIndex;
      const delay = isNamePart
        ? nameStartIndex * 28 + (i - nameStartIndex) * 34
        : i * 28;
      setTimeout(() => {
        el.style.opacity = "1";
      }, delay);
    });
  }, [revealed, fullText, nameStartIndex]);

  return (
    <div className="flex items-baseline justify-between w-full mb-10">
      <p className="font-[var(--font-heading)] text-[26px] font-light text-[var(--color-text-primary)] whitespace-nowrap">
        {fullText.split("").map((char, i) => (
          <span
            key={i}
            ref={(el) => { charsRef.current[i] = el; }}
            className="transition-opacity duration-[180ms] ease-in-out"
            style={{ opacity: 0 }}
          >
            {char}
          </span>
        ))}
      </p>
      <p className="font-[var(--font-heading)] text-[18px] font-medium text-[var(--color-text-primary)] text-right shrink-0 ml-auto">
        {getFormattedDate()}
      </p>
    </div>
  );
}
