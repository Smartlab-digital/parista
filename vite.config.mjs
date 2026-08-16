import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this project from https://smartlab-digital.github.io/parista/.
  base: '/parista/',
});
