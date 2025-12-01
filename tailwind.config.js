/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tema NITRON FLOW - Moderno e Limpo
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff',
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
        },
        neon: {
          cyan: '#00ffff',
          blue: '#0080ff',
          electric: '#00d4ff',
        },
        dark: {
          deep: '#0a0a0f',
          black: '#111827',
          gray: '#1f2937',
          lighter: '#374151',
          lightest: '#4b5563',
        },
        card: {
          bg: '#111827',
          border: '#1f2937',
          hover: '#1f2937',
        },
        accent: {
          electric: '#00d4ff',
          cyan: '#00ffff',
          blue: '#0080ff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
