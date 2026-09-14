// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Canonical URL used for JSON-LD, sitemap and the MCP catalog. Override via PUBLIC_SITE_URL.
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',

  // SSR by default so product pages always reflect live price/stock.
  // Opt individual static pages in with `export const prerender = true`.
  output: 'server',
  // Node for local dev / VPS; `DEPLOY_TARGET=cloudflare` (see `build:cf`) targets Cloudflare Workers.
  adapter: process.env.DEPLOY_TARGET === 'cloudflare' ? cloudflare({ imageService: 'compile' }) : node({ mode: 'standalone' }),

  integrations: [react()],
  vite: { plugins: [tailwindcss()] },

  // Typed, validated env — import from 'astro:env/client' or 'astro:env/server'.
  env: {
    schema: {
      PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public', default: 'http://localhost:4321' }),
      PUBLIC_SITE_NAME: envField.string({ context: 'client', access: 'public', default: 'Agentic Store' }),
      PUBLIC_CURRENCY: envField.string({ context: 'client', access: 'public', default: 'USD' }),

      PUBLIC_SUPABASE_URL: envField.string({ context: 'client', access: 'public', default: 'http://127.0.0.1:54321' }),
      PUBLIC_SUPABASE_ANON_KEY: envField.string({ context: 'client', access: 'public', default: '' }),
      // auto = demo when no Supabase key is set; on/off force it. See src/lib/demo.ts
      PUBLIC_DEMO_MODE: envField.enum({ context: 'client', access: 'public', values: ['auto', 'on', 'off'], default: 'auto' }),
      SUPABASE_SERVICE_ROLE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),

      PUBLIC_HCAPTCHA_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      HCAPTCHA_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),

      // 'local' | 'hostinger'
      STORAGE_DRIVER: envField.enum({ context: 'server', access: 'public', values: ['local', 'hostinger'], default: 'local' }),
      LOCAL_UPLOAD_DIR: envField.string({ context: 'server', access: 'public', default: 'public/uploads' }),
      HOSTINGER_UPLOAD_ENDPOINT: envField.string({ context: 'server', access: 'public', optional: true }),
      HOSTINGER_UPLOAD_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      HOSTINGER_BASE_URL: envField.string({ context: 'server', access: 'public', optional: true }),
    },
  },
});
