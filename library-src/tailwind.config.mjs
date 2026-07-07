/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: '#F7F3EC', elevated: '#FCFAF5' },
        accent:  { DEFAULT: '#163C25', lt: '#3F7D5B' },
        text:    { DEFAULT: '#211D18', muted: '#6B6459', faint: '#9C9488' },
      },
      fontFamily: {
        sans:  ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        sm:   '8px',
        pill: '999px',
      },
      boxShadow: {
        card:  '0 1px 2px rgba(33,29,24,0.05), 0 14px 32px rgba(33,29,24,0.08)',
        cover: '6px 6px 24px rgba(33,29,24,0.2)',
        modal: '0 25px 60px rgba(33,29,24,0.18)',
      },
    },
  },
  plugins: [],
};
