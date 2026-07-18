/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf2f4',
          100: '#fbe6ea',
          200: '#f5c9d3',
          300: '#eba3b5',
          400: '#db6f8c',
          500: '#c43f64',
          600: '#a3234d',
          700: '#8a1e41',
          800: '#6f1a34',
          900: '#5a1a2e',
          950: '#330b16',
        },
        accent: {
          50: '#fffaf0',
          100: '#fff3d9',
          200: '#ffe5ad',
          300: '#ffcf70',
          400: '#ffb13a',
          500: '#f99017',
          600: '#db6f0c',
          700: '#b64e0c',
          800: '#923e12',
          900: '#783412',
          950: '#451a06',
        },
        ink: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b9b9c2',
          400: '#8e8e9c',
          500: '#6d6d7e',
          600: '#575767',
          700: '#464654',
          800: '#3b3b47',
          900: '#1f1f27',
          950: '#131318',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Poppins"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 30px -10px rgba(138,30,65,0.25), 0 4px 12px rgba(0,0,0,0.08)',
        soft: '0 2px 8px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.4s ease both',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
