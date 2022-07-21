import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  // Static assets that will be copied to the root of ./dist
  // index.html is explicitly supposed to be at the root and not
  // in ./public:
  //  https://vitejs.dev/guide/#index-html-and-project-root
  publicDir: 'public',
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
