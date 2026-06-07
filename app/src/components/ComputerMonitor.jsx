/**
 * ComputerMonitor — Light-themed futuristic SVG monitor.
 * Chassis is a pale aluminum/slate with vivid indigo+cyan neon corner accents.
 * Screen fill (#eef0f8) matches the light desktop background for a seamless zoom.
 */
import { forwardRef } from 'react'

const ComputerMonitor = forwardRef(function ComputerMonitor(_, ref) {
  return (
    <div
      ref={ref}
      className="monitor-responsive gpu"
      style={{
        filter: 'drop-shadow(0 8px 40px rgba(79,70,229,0.18)) drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
      }}
    >
      <svg
        viewBox="0 0 560 500"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="w-full h-auto"
      >
        <defs>
          {/* Chassis — light aluminum */}
          <linearGradient id="chassisGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e8eaf4" />
            <stop offset="50%"  stopColor="#d8dcea" />
            <stop offset="100%" stopColor="#c8cce0" />
          </linearGradient>

          {/* Bezel — slightly lighter */}
          <linearGradient id="bezelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#eceef8" />
            <stop offset="100%" stopColor="#dde0ef" />
          </linearGradient>

          {/* Stand */}
          <linearGradient id="standGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#dde0ec" />
            <stop offset="100%" stopColor="#c4c8da" />
          </linearGradient>

          {/* Screen subtle inner shadow */}
          <linearGradient id="screenInner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.03" />
          </linearGradient>

          {/* Neon glow — soft */}
          <filter id="glowSoft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Neon glow — strong */}
          <filter id="glowStrong" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* LED glow */}
          <filter id="ledGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Chassis edge rim */}
          <linearGradient id="rimTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── STAND BASE ────────────────────────────────── */}
        <ellipse cx="280" cy="487" rx="96" ry="9" fill="rgba(79,70,229,0.08)" />
        <rect x="218" y="465" width="124" height="25" rx="5" fill="url(#standGrad)" />
        {/* Stand neck */}
        <path d="M253 428 L262 465 L298 465 L307 428" fill="url(#standGrad)" />
        {/* Stand collar */}
        <rect x="238" y="425" width="84" height="8" rx="4" fill="#cdd0e2" />

        {/* ── CHASSIS BODY ──────────────────────────────── */}
        <rect x="18" y="18" width="524" height="412" rx="16" fill="url(#chassisGrad)" />

        {/* Top highlight rim */}
        <rect x="18" y="18" width="524" height="2" rx="1" fill="url(#rimTop)" />
        {/* Left rim */}
        <rect x="18" y="18" width="1.5" height="412" fill="rgba(255,255,255,0.5)" />
        {/* Bottom shadow */}
        <rect x="18" y="428" width="524" height="2" rx="1" fill="rgba(0,0,0,0.08)" />
        {/* Right shadow */}
        <rect x="540.5" y="18" width="1.5" height="412" fill="rgba(0,0,0,0.06)" />

        {/* ── BEZEL ─────────────────────────────────────── */}
        <rect x="32" y="32" width="496" height="384" rx="10" fill="url(#bezelGrad)" />

        {/* ── SCREEN — matches light desktop bg exactly ─── */}
        <rect x="44" y="44" width="472" height="352" rx="6" fill="#eef0f8" />
        {/* Screen top-left gloss */}
        <rect x="44" y="44" width="472" height="352" rx="6" fill="url(#screenInner)" />
        {/* Screen hairline border */}
        <rect x="44" y="44" width="472" height="352" rx="6" fill="none"
              stroke="rgba(79,70,229,0.1)" strokeWidth="1" />

        {/* ── NEON CORNER ACCENTS ───────────────────────── */}
        {/* Top-left — indigo */}
        <path d="M32 88 L32 33 L88 33"
              stroke="#4f46e5" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />
        {/* Top-right — indigo */}
        <path d="M472 33 L528 33 L528 88"
              stroke="#4f46e5" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />
        {/* Bottom-left — cyan */}
        <path d="M32 340 L32 414 L88 414"
              stroke="#0891b2" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />
        {/* Bottom-right — cyan */}
        <path d="M472 414 L528 414 L528 340"
              stroke="#0891b2" strokeWidth="1.8" fill="none"
              filter="url(#glowSoft)" strokeLinecap="round" />

        {/* Dashed accent lines */}
        <line x1="130" y1="33" x2="430" y2="33"
              stroke="#4f46e5" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.35" />
        <line x1="130" y1="414" x2="430" y2="414"
              stroke="#0891b2" strokeWidth="0.5" strokeDasharray="6 4" opacity="0.35" />

        {/* ── BEZEL SIDE TEXTURE LINES ─────────────────── */}
        {[340, 348, 356, 364, 372, 380].map((y, i) => (
          <line key={i} x1="33" y1={y} x2="41" y2={y}
                stroke="rgba(79,70,229,0.25)" strokeWidth="0.5" />
        ))}
        {[340, 348, 356, 364, 372, 380].map((y, i) => (
          <line key={`r${i}`} x1="519" y1={y} x2="527" y2={y}
                stroke="rgba(79,70,229,0.25)" strokeWidth="0.5" />
        ))}

        {/* ── WEBCAM ───────────────────────────────────── */}
        <circle cx="280" cy="38" r="4.5" fill="#d0d3e8" />
        <circle cx="280" cy="38" r="2.5" fill="#c0c4d8" />
        <circle cx="280" cy="38" r="1.2" fill="#adb2cc" />
        <circle cx="279" cy="37" r="0.5" fill="rgba(255,255,255,0.6)" />

        {/* ── PORT STRIP ───────────────────────────────── */}
        <rect x="462" y="423" width="24" height="7" rx="3.5" fill="#c8cce0" />
        <rect x="463" y="424" width="22" height="5" rx="2.5" fill="#b8bcd4" />
        <rect x="494" y="422" width="20" height="9" rx="2" fill="#c8cce0" />
        <rect x="495" y="423" width="18" height="7" rx="1.5" fill="#b8bcd4" />
        <path d="M520 422 L544 422 L544 430 L518 430 Z" fill="#c8cce0" />
        <path d="M522 423 L542 423 L542 429 L520 429 Z" fill="#b8bcd4" />

        {/* ── POWER BUTTON ─────────────────────────────── */}
        <circle cx="280" cy="423" r="7" fill="#cdd0e2" />
        <circle cx="280" cy="423" r="5" fill="#d5d8ea" />
        <path d="M280 419 L280 422.5" stroke="rgba(79,70,229,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M276.5 420.5 A5 5 0 1 0 283.5 420.5"
              stroke="rgba(79,70,229,0.5)" strokeWidth="1.2"
              fill="none" strokeLinecap="round" />

        {/* ── POWER LED ────────────────────────────────── */}
        <circle cx="264" cy="423" r="2.5" fill="#0891b2"
                filter="url(#ledGlow)"
                className="animate-led-pulse" />

        {/* ── OUTER RIM SHADOW ─────────────────────────── */}
        <rect x="18" y="18" width="524" height="412" rx="16"
              fill="none" stroke="rgba(79,70,229,0.1)" strokeWidth="1.5"
              filter="url(#glowStrong)" />
      </svg>
    </div>
  )
})

export default ComputerMonitor
