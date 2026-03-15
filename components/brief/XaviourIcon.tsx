"use client";

import React, { useId } from "react";

/**
 * Xaviour AI — Cosmic Nebula Core
 *
 * The official Xaviour AI mark. Concentric orbital rings with a radiant
 * central core and scattered nebula particles. Represents calm cosmic
 * intelligence — a signal from the center of the universe.
 */

interface XaviourIconProps {
  /** Icon size in px */
  size?: number;
  /** Animation mode */
  animate?: "none" | "idle" | "pulse" | "thinking";
  /** Additional className */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

export default function XaviourIcon({
  size = 24,
  animate = "none",
  className = "",
  style,
}: XaviourIconProps) {
  const uid = useId().replace(/:/g, "");

  const animClass =
    animate === "idle"
      ? "xav-icon-idle"
      : animate === "pulse"
        ? "xav-icon-pulse"
        : animate === "thinking"
          ? "xav-icon-thinking"
          : "";

  // At small sizes (≤16px rendered), simplify for clarity
  const isSmall = size <= 16;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animClass} ${className}`.trim()}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {/* Outer orbital ring */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={`url(#${uid}g1)`}
        strokeWidth={isSmall ? "1.2" : "0.8"}
        opacity={isSmall ? "0.5" : "0.45"}
      />

      {/* Middle orbital ring */}
      <circle
        cx="12"
        cy="12"
        r="7"
        stroke={`url(#${uid}g2)`}
        strokeWidth={isSmall ? "1.4" : "1.1"}
        opacity={isSmall ? "0.65" : "0.6"}
      />

      {/* Inner core glow */}
      <circle
        cx="12"
        cy="12"
        r={isSmall ? "4.5" : "4"}
        fill={`url(#${uid}g3)`}
        opacity="0.7"
      />

      {/* Central bright core */}
      <circle
        cx="12"
        cy="12"
        r={isSmall ? "3.2" : "2.8"}
        fill={`url(#${uid}g4)`}
      />

      {/* Nebula particles — hidden at tiny sizes */}
      {!isSmall && (
        <>
          <circle cx="16" cy="8" r="1.1" fill="#60A5FA" opacity="0.8" />
          <circle cx="17" cy="9" r="0.6" fill="#93C5FD" opacity="0.6" />

          <circle cx="8" cy="16" r="1.1" fill="#818CF8" opacity="0.8" />
          <circle cx="7" cy="15" r="0.6" fill="#A5B4FC" opacity="0.6" />

          <circle cx="8" cy="8" r="0.9" fill="#67E8F9" opacity="0.7" />

          <circle cx="16" cy="16" r="0.9" fill="#7C3AED" opacity="0.5" />
        </>
      )}

      <defs>
        <linearGradient id={`${uid}g1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>

        <linearGradient id={`${uid}g2`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>

        <radialGradient id={`${uid}g3`}>
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
        </radialGradient>

        <radialGradient id={`${uid}g4`}>
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * Inline mark variant — for use inside text flows.
 */
export function XaviourMark({
  size = 18,
  animate = "none",
  className = "",
  style,
}: XaviourIconProps) {
  return (
    <XaviourIcon
      size={size}
      animate={animate}
      className={className}
      style={{
        verticalAlign: "baseline",
        position: "relative",
        top: "2px",
        ...style,
      }}
    />
  );
}
