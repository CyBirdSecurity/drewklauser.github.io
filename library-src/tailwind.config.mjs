/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: '#07080f', elevated: '#0d1017' },
        purple:  { DEFAULT: '#7c3aed', lt: '#a78bfa' },
        blue:    { DEFAULT: '#2563eb', lt: '#60a5fa' },
        cyan:    { DEFAULT: '#06b6d4', lt: '#67e8f9' },
        text:    { DEFAULT: '#f8fafc', muted: '#94a3b8', faint: '#475569' },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        sm:   '8px',
        pill: '999px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        cover: '6px 6px 24px rgba(0,0,0,0.7)',
        modal: '0 25px 60px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
};
