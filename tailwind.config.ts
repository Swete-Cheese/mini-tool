import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060912',
          900: '#0a0f1a',
          800: '#0f172a',
          700: '#1a2540',
          600: '#243356',
          500: '#2d4068',
        },
        gold: {
          400: '#d4a853',
          500: '#c4963a',
          600: '#a87d2e',
        },
      },
      fontFamily: {
        document: ['"Noto Serif SC"', '"Source Han Serif SC"', 'SimSun', 'serif'],
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
