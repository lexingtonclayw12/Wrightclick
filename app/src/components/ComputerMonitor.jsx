/**
 * ComputerMonitor — Highly detailed futuristic SVG monitor
 * All neon lines are individually targetable via refs for GSAP.
 * The screen rect fill (#07070f) matches the desktop bg for a seamless zoom.
 */
import { forwardRef } from 'react'

const ComputerMonitor = forwardRef(function ComputerMonitor(_, ref) {
  return (
    <div
      ref={ref}
      className="monitor-responsive gpu"
      style={{ filter: 'drop-shadow(0 0 40px rgba(99,102,241,0.28)) drop-shadow(0 20px 60px rgba(0,0,0,0.9))' }}
    >
      <svg
        viewBox="0 0 560 500"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-full h-auto"
      >
        <defs>
          {/* Chassis metal gradient */}
          <linearGradient id="chassisGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1c1c30" />
            <stop offset="45%"  stopColor="#111120" />
            <stop offset="100%" stopColor="#0c0c1a" />
          </linearGradient>

          {/* Bezel gradient */}
          <linearGradient id="bezelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#14142a" />
            <stop offset="100%" stopColor="#0a0a18" />
          </linearGradient>

          {/* Stand gradient */}
          <linearGradient id="standGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0d0d1c" />
          </linearGradient>

          {/* Screen corner reflection */}
          <linearGradient id="screenReflect" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.025" />
            <stop offset="60%"  stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Neon glow filter — soft */}
          <filter id="glowSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Neon glow filter — strong */}
          <filter id="glowStrong" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* LED dot glow */}
          <filter id="ledGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Screen inner glow */}
          <radialGradient id="screenGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── STAND BASE ────────────────────────────────── */}
        <ellipse cx="280" cy="487" rx="96" ry="9" fill="#0a0a15" />
        <rect x="218" y="465" width="124" height="25" rx="5" fill="url(#standGrad)" />
        {/* Stand neck — trapezoid */}
        <path d="M253 428 L262 465 L298 465 L307 428" fill="url(#standGrad)" />
        {/* Stand collar */}
        <rect x="238" y="425" width="84" height="8" rx="4" fill="#181830" />

        {/* ── CHASSIS BODY ──────────────────────────────── */}
        <rect x="18" y="18" width="524" height="412" rx="16" fill="url(#chassisGrad)" />

        {/* Chassis top highlight edge */}
        <rect x="18" y="18" width="524" height="2" rx="1" fill="rgba(255,255,255,0.05)" />
        {/* Left edge subtle highlight */}
        <rect x="18" y="18" width="1.5" height="412" fill="rgba(255,255,255,0.03)" />
        {/* Right edge */}
        <rect x="540.5" y="18" width="1.5" height="412" fill="rgba(0,0,0,0.3)" />
        {/* Bottom shadow edge */}
        <rect x="18" y="428" width="524" height="2" rx="1" fill="rgba(0,0,0,0.5)" />

        {/* ── BEZEL (inner frame) ───────────────────────── */}
        <rect x="32" y="32" width="496" height="384" rx="10" fill="url(#bezelGrad)" />

        {/* ── SCREEN ────────────────────────────────────── */}
        {/* Main screen — same dark as page background for seamless zoom */}
        <rect x="44" y="44" width="472" height="352" rx="6" fill="#07070f" />
        {/* Screen top reflection */}
        <rect x="44" y="44" width="472" height="352" rx="6" fill="url(#screenReflect)" />
        {/* Screen inner glow bloom */}
        <rect x="44" y="44" width="472" height="352" rx="6" fill="url(#screenGlow)" />
        {/* Screen edge micro-border */}
        <rect x="44" y="44" width="472" height="352" rx="6" fill="none"
              stroke="rgba(99,102,241,0.12)" strokeWidth="1" />

        {/* ── NEON CORNER ACCENTS ───────────────────────── */}
        {/* Top-left — indigo */}
        <path d="M32 88 L32 33 L88 33"
              stroke="#6366f1" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />
        {/* Top-right — indigo */}
        <path d="M472 33 L528 33 L528 88"
              stroke="#6366f1" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />
        {/* Bottom-left — cyan */}
        <path d="M32 340 L32 414 L88 414"
              stroke="#06b6d4" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />
        {/* Bottom-right — cyan */}
        <path d="M472 414 L528 414 L528 340"
              stroke="#06b6d4" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />

        {/* Dashed top accent line */}
        <line x1="130" y1="33" x2="430" y2="33"
              stroke="#6366f1" strokeWidth="0.6"
              strokeDasharray="6 4" opacity="0.4" />
        {/* Dashed bottom accent line */}
        <line x1="130" y1="414" x2="430" y2="414"
              stroke="#06b6d4" strokeWidth="0.6"
              strokeDasharray="6 4" opacity="0.4" />

        {/* ── BEZEL SIDE SCAN LINES (texture detail) ────── */}
        {[340, 348, 356, 364, 372, 380].map((y, i) => (
          <line key={i} x1="33" y1={y} x2="41" y2={y}
                stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />
        ))}
        {[340, 348, 356, 364, 372, 380].map((y, i) => (
          <line key={i} x1="519" y1={y} x2="527" y2={y}
                stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" />
        ))}

        {/* ── WEBCAM (top center bezel) ─────────────────── */}
        <circle cx="280" cy="38" r="4.5" fill="#0d0d1e" />
        <circle cx="280" cy="38" r="2.5" fill="#111126" />
        <circle cx="280" cy="38" r="1.2" fill="#1a1a35" />
        {/* Lens highlight */}
        <circle cx="279" cy="37" r="0.5" fill="rgba(255,255,255,0.2)" />

        {/* ── PORT STRIP (bottom right of chassis) ─────── */}
        {/* USB-C */}
        <rect x="462" y="423" width="24" height="7" rx="3.5" fill="#101028" />
        <rect x="463" y="424" width="22" height="5" rx="2.5" fill="#080818" />
        {/* USB-A */}
        <rect x="494" y="422" width="20" height="9" rx="2" fill="#101028" />
        <rect x="495" y="423" width="18" height="7" rx="1.5" fill="#080818" />
        {/* HDMI */}
        <path d="M520 422 L544 422 L544 430 L518 430 Z" fill="#101028" />
        <path d="M522 423 L542 423 L542 429 L520 429 Z" fill="#080818" />

        {/* ── POWER BUTTON (bottom center) ─────────────── */}
        <circle cx="280" cy="423" r="7" fill="#0f0f22" />
        <circle cx="280" cy="423" r="5" fill="#141430" />
        {/* Power icon */}
        <path d="M280 419 L280 422.5" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M276.5 420.5 A5 5 0 1 0 283.5 420.5"
              stroke="rgba(99,102,241,0.5)" strokeWidth="1.2"
              fill="none" strokeLinecap="round" />

        {/* ── POWER LED (glows) ─────────────────────────── */}
        <circle cx="264" cy="423" r="2.5" fill="#06b6d4"
                filter="url(#ledGlow)"
                className="animate-led-pulse" />

        {/* ── CHASSIS CORNER RADIUS SHADOW ─────────────── */}
        <rect x="18" y="18" width="524" height="412" rx="16"
              fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />

        {/* ── SUBTLE SCREEN HORIZONTAL SCAN LINES ──────── */}
        {[80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => (
          <line key={i}
                x1="44" y1={y} x2="516" y2={y}
                stroke="rgba(99,102,241,0.015)" strokeWidth="0.5" />
        ))}

        {/* ── NEON EDGE GLOW (overall monitor rim) ─────── */}
        <rect x="18" y="18" width="524" height="412" rx="16"
              fill="none"
              stroke="rgba(99,102,241,0.08)" strokeWidth="2"
              filter="url(#glowStrong)" />
      </svg>
    </div>
  )
})

export default ComputerMonitor
