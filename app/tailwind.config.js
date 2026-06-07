/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'screen':   '#07070f',
        'chassis':  '#12121f',
        'bezel':    '#0e0e1c',
        'neon-indigo': '#6366f1',
        'neon-cyan':   '#06b6d4',
        'neon-purple': '#a855f7',
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
