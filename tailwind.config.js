/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/[locale]/(dashboard)/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // الألوان الأساسية
        primary: {
          DEFAULT: '#2C3E50', // Industrial Blue
          light: '#3a5a6e',
          dark: '#1e2e3c',
        },
        secondary: {
          DEFAULT: '#1ABC9C', // Cement Teal
          light: '#2eccb0',
          dark: '#16a085',
        },
        accent: {
          DEFAULT: '#F1C40F', // Construction Yellow
          light: '#f4d03f',
          dark: '#d4ac0d',
        },
        background: {
          DEFAULT: '#F8F9FA', // Light Slate Grey
          card: '#FFFFFF',
          muted: '#E9ECEF',
        },
        text: {
          primary: '#2C3E50',
          secondary: '#5A6E8A',
          muted: '#9AA6B5',
          white: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E9ECEF',
          dark: '#DEE2E6',
        },
        success: {
          DEFAULT: '#1ABC9C',
          light: '#d1f7ed',
        },
        warning: {
          DEFAULT: '#F1C40F',
          light: '#fef5e0',
        },
        danger: {
          DEFAULT: '#E74C3C',
          light: '#fde5e2',
        },
        info: {
          DEFAULT: '#3498DB',
          light: '#e3f2fd',
        },
      },
      boxShadow: {
        card: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        cardHover: '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
}