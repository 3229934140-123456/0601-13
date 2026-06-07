/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        gold: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        film: {
          50: '#f7f7f8',
          100: '#eeeeef',
          200: '#d9d9dc',
          300: '#b8b8be',
          400: '#919199',
          500: '#73737d',
          600: '#5d5d66',
          700: '#4c4c53',
          800: '#404046',
          900: '#37373c',
          950: '#0F0F12',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      boxShadow: {
        'gold-glow': '0 0 30px -5px rgba(212, 175, 55, 0.3)',
        'card': '0 4px 20px -5px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
