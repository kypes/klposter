// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      // Configure Tailwind CSS settings here if needed
      applyBaseStyles: false, // We're importing global.css manually
    }),
    react()
  ]
});