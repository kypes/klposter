/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'discord-blue': '#5865F2',
        'spotify-green': '#1DB954',
        'lastfm-red': '#D51007'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#5865F2',
          secondary: '#1DB954',
          accent: '#D51007',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#5865F2',
          secondary: '#1DB954',
          accent: '#D51007',
        },
      },
    ],
    darkTheme: 'dark',
  },
}; 