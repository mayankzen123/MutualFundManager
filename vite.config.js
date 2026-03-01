import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Agent } from 'node:https'

const SUPABASE_HOST = 'xwcgqybqoowfqlueensz.supabase.co'
const SUPABASE_ORIGIN = `https://${SUPABASE_HOST}`

const supabaseAgent = new Agent({
  lookup: (hostname, opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }
    if (opts && opts.all) {
      cb(null, [{ address: '104.18.38.10', family: 4 }])
    } else {
      cb(null, '104.18.38.10', 4)
    }
  },
  servername: SUPABASE_HOST,
})

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/supabase-proxy': {
        target: SUPABASE_ORIGIN,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/supabase-proxy/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Host', SUPABASE_HOST)
          })
        },
        agent: supabaseAgent,
      },
    },
  },
})
