/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'screen':      '#eef0f8',
        'chassis':     '#d8dcea',
        'bezel':       '#e5e8f2',
        'neon-indigo': '#4f46e5',
        'neon-cyan':   '#0891b2',
        'neon-purple': '#7c3aed',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        ledPulse: {
          '0%,100%': { opacity: '0.5', filter: 'blur(0px)' },
          '50%':     { opacity: '1',   filter: 'blur(2px)' },
        },
        rippleExpand: {
          '0%':   { transform: 'scale(1)',   opacity: '0.8' },
          '100%': { transform: 'scale(6)',   opacity: '0' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        marqueescroll: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'led-pulse':  'ledPulse 2.4s ease-in-out infinite',
        'ripple':     'rippleExpand 0.8s ease-out forwards',
        'scanline':   'scanline 14s linear infinite',
        'marquee':    'marqueescroll 28s linear infinite',
      },
    },
  },
  plugins: [],
}
