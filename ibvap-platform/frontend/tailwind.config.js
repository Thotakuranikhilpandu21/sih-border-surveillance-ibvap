/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: '#0B0F19',
          surface: '#111827',
          panel: '#1E293B',
          border: '#334155',
          accent: '#10B981',
          critical: '#EF4444',
          warning: '#F59E0B',
          cyan: '#06B6D4'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
