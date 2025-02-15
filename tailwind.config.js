/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        punk: ['var(--font-punk)', 'system-ui', 'sans-serif'],
      },
      colors: {
        punk: {
          pink: '#FF006E',
          yellow: '#FFD700',
          black: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
} 