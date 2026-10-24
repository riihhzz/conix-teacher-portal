import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const root = import.meta.dirname;
const pages = ['dashboard', 'materi', 'misi', 'misi-editor', 'siswa', 'profil'];

/** Nama repo GitHub = sub-path di GitHub Pages (https://<user>.github.io/<repo>/). */
const REPO_NAME = 'conix-teacher-portal';

export default defineConfig(({ command, isPreview }) => ({
  // dev: "/", build & preview: "/conix-teacher-portal/" seperti di GitHub Pages
  base: command === 'build' || isPreview ? `/${REPO_NAME}/` : '/',
  plugins: [tailwindcss()],
  resolve: {
    alias: { '@': resolve(root, 'src') },
  },
  server: {
    port: 5173,
    open: '/index.html',
  },
  build: {
    rollupOptions: {
      input: {
        landing: resolve(root, 'index.html'),
        login: resolve(root, 'auth/login.html'),
        register: resolve(root, 'auth/register.html'),
        ...Object.fromEntries(pages.map((p) => [p, resolve(root, `pages/${p}.html`)])),
      },
    },
  },
}));
