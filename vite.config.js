import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import tailwindcss from '@tailwindcss/vite'

// Rute yang diberi salinan index.html agar server statis biasa
// (tanpa fallback SPA) tidak mengembalikan 404 saat halaman dibuka langsung.
const STATIC_ROUTES = ['auth/login', 'auth/register', 'users', 'profile', 'link-trees']

// Rute dinamis /link-trees/:linkTreeId untuk ID 1 sampai 500.
const LINK_TREE_ROUTES = Array.from({ length: 500 }, (_, index) => `link-trees/${index + 1}`)

// Menyisipkan CSS hasil build ke dalam index.html agar tidak ada
// stylesheet terpisah yang memblokir render awal halaman.
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html
        let result = html
        for (const [fileName, asset] of Object.entries(bundle)) {
          if (!fileName.endsWith('.css')) continue
          result = result.replace(/<link[^>]+rel="stylesheet"[^>]*>/g, (tag) =>
            tag.includes(fileName) ? `<style>${asset.source}</style>` : tag
          )
          delete bundle[fileName]
        }
        return result
      }
    }
  }
}

function spaFallback() {
  let outDir = 'dist'
  return {
    name: 'spa-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const indexFile = resolve(outDir, 'index.html')
      copyFileSync(indexFile, resolve(outDir, '404.html'))
      for (const route of [...STATIC_ROUTES, ...LINK_TREE_ROUTES]) {
        const target = resolve(outDir, route, 'index.html')
        mkdirSync(dirname(target), { recursive: true })
        copyFileSync(indexFile, target)
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  // APP_PORT tidak berawalan VITE_, sehingga dimuat dengan prefix kosong.
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.APP_PORT) || 3004

  return {
    base: '/',
    appType: 'spa',
    plugins: [tailwindcss(), svelte(), svelteTesting(), inlineCss(), spaFallback()],
    server: { host: true, port, strictPort: true, allowedHosts: true },
    preview: { host: true, port, strictPort: true, allowedHosts: true },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.test.js'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{js,svelte}'],
        exclude: ['src/**/*.test.js', 'src/test/**'],
        reporter: ['text', 'html'],
        thresholds: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100
        }
      }
    }
  }
})