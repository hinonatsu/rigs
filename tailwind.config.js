/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#08090B',
          900: '#0D0F12',
          850: '#12151A',
          800: '#171B22',
          700: '#222731',
          600: '#2E3543',
        },
        electric: {
          DEFAULT: '#00D2FF',
          dim: '#009EC2',
          subtle: 'rgba(0, 210, 255, 0.08)',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Noto Sans JP"', 'sans-serif'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
