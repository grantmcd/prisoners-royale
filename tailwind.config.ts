import type { Config } from 'tailwindcss'

export default {
  content: ['./client/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        terminal: {
          bg: '#0a0a0a',
          fg: '#00ff41',
          dim: '#003b00',
          accent: '#008f11',
          warning: '#ffcc00',
          danger: '#ff3333',
        },
      },
      animation: {
        'scanline': 'scanline 10s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.95' },
          '10%': { opacity: '0.9' },
          '15%': { opacity: '0.98' },
          '20%': { opacity: '0.96' },
          '25%': { opacity: '0.94' },
          '30%': { opacity: '0.99' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
