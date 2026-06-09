import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://drewklauser.com',
  base: '/library',
  integrations: [tailwind()],
  output: 'static',
  outDir: '../library',
});
