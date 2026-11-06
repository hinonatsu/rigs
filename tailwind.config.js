/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        matte: {
          DEFAULT: '#1A1A1A',
          deep: '#141414',
          elevated: '#222222',
        },
        charcoal: {
          DEFAULT: '#2D2D2D',
          light: '#383838',
          border: '#424242',
        },
        carbon: {
          950: '#1A1A1A',
          900: '#222222',
          850: '#272727',
          800: '#2D2D2D',
          700: '#3D3D3D',
          600: '#525252',
        },
        electric: {
          DEFAULT: '#00E5FF',
          dim: '#00B8CC',
          glow: 'rgba(0, 229, 255, 0.35)',
          subtle: 'rgba(0, 229, 255, 0.10)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
        inter: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
        oswald: ['"Oswald"', '"Inter"', 'sans-serif'],
        display: ['"Oswald"', '"Inter"', '"Noto Sans JP"', 'sans-serif'],
        jp: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Oswald"', 'monospace'],
      },
      boxShadow: {
        'cyber-glow': '0 0 25px -2px rgba(0, 229, 255, 0.38), 0 12px 30px -6px rgba(0, 0, 0, 0.65)',
        'cyber-glow-lg': '0 0 35px 0px rgba(0, 229, 255, 0.45), 0 18px 40px -8px rgba(0, 0, 0, 0.75)',
        'cyber-selected': '0 0 22px -3px rgba(0, 229, 255, 0.32), inset 0 1px 0 0 rgba(0, 229, 255, 0.25)',
        'bento-glass': '0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      transitionTimingFunction: {
        'cyber-float': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'cyber-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
