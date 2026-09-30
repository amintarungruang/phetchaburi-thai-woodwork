import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#FBF8F3',
          100: '#F5ECE1',
          200: '#E8D5C1',
          300: '#D5B697',
          400: '#BD916D',
          500: '#A47248',
          600: '#8B5A2B', // Warm Teak
          700: '#6B421E', // Rich Wood
          800: '#4E2F16', // Dark Teak
          900: '#341F0E', // Deep Timber
          950: '#1F1208',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F9F1D6',
          200: '#F1E0A7',
          300: '#E7CC73',
          400: '#DCB744',
          500: '#C59B27', // Heritage Gold
          600: '#A67B1B',
          700: '#835C16',
          800: '#684717',
          900: '#563B17',
          950: '#321F0A',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EAE1D7',
          400: '#D8C9BA',
          500: '#C2B09F',
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'sans-serif'],
        serif: ['Noto Serif Thai', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA7C11 100%)',
        'wood-gradient': 'linear-gradient(180deg, rgba(31,18,8,0.85) 0%, rgba(52,31,14,0.95) 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
