import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Allows hosting on any GitHub Pages subpath (e.g. https://username.github.io/repo-name/)
});
