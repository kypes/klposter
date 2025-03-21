/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core background colors
        'surface': {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          50: 'rgb(var(--color-surface-50) / <alpha-value>)',
          100: 'rgb(var(--color-surface-100) / <alpha-value>)',
          200: 'rgb(var(--color-surface-200) / <alpha-value>)',
          300: 'rgb(var(--color-surface-300) / <alpha-value>)',
          400: 'rgb(var(--color-surface-400) / <alpha-value>)',
          500: 'rgb(var(--color-surface-500) / <alpha-value>)',
          600: 'rgb(var(--color-surface-600) / <alpha-value>)',
          700: 'rgb(var(--color-surface-700) / <alpha-value>)',
          800: 'rgb(var(--color-surface-800) / <alpha-value>)',
          900: 'rgb(var(--color-surface-900) / <alpha-value>)',
          950: 'rgb(var(--color-surface-950) / <alpha-value>)',
        },
        // Brand colors
        'brand': {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          50: 'rgb(var(--color-brand-50) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
          200: 'rgb(var(--color-brand-200) / <alpha-value>)',
          300: 'rgb(var(--color-brand-300) / <alpha-value>)',
          400: 'rgb(var(--color-brand-400) / <alpha-value>)',
          500: 'rgb(var(--color-brand-500) / <alpha-value>)',
          600: 'rgb(var(--color-brand-600) / <alpha-value>)',
          700: 'rgb(var(--color-brand-700) / <alpha-value>)',
          800: 'rgb(var(--color-brand-800) / <alpha-value>)',
          900: 'rgb(var(--color-brand-900) / <alpha-value>)',
          950: 'rgb(var(--color-brand-950) / <alpha-value>)',
        },
        // Accent colors for UI elements
        'accent': {
          blue: '#2D7FF9',
          purple: '#8B5CF6',
          pink: '#EC4899',
          green: '#22C55E',
          yellow: '#F59E0B'
        },
        // Text colors
        'content': {
          DEFAULT: 'rgb(var(--color-content) / <alpha-value>)',
          50: 'rgb(var(--color-content-50) / <alpha-value>)',
          100: 'rgb(var(--color-content-100) / <alpha-value>)',
          200: 'rgb(var(--color-content-200) / <alpha-value>)',
          300: 'rgb(var(--color-content-300) / <alpha-value>)',
          400: 'rgb(var(--color-content-400) / <alpha-value>)',
          500: 'rgb(var(--color-content-500) / <alpha-value>)',
          600: 'rgb(var(--color-content-600) / <alpha-value>)',
          700: 'rgb(var(--color-content-700) / <alpha-value>)',
          800: 'rgb(var(--color-content-800) / <alpha-value>)',
          900: 'rgb(var(--color-content-900) / <alpha-value>)',
          950: 'rgb(var(--color-content-950) / <alpha-value>)',
        },
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        discord: '#5865F2'
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji']
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgb(var(--color-brand-400) / 0.1)',
        'glow-lg': '0 0 30px -5px rgba(88, 101, 242, 0.4)',
        'inner-bright': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-shine': 'linear-gradient(45deg, transparent 25%, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 50%, transparent 50%, transparent 75%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1))',
      },
    }
  },
  plugins: [
    forms,
    typography,
    aspectRatio,
    function({ addBase, theme }) {
      addBase({
        'body': {
          backgroundColor: theme('colors.surface.DEFAULT'),
          color: theme('colors.content.DEFAULT'),
        },
      });
    }
  ]
}; 