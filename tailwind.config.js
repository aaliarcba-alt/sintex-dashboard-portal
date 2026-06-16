/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: { neon: '#00D4FF' },
        pink: { neon: '#FF2D9B' },
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,212,255,0.3)',
        'neon-pink': '0 0 20px rgba(255,45,155,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
