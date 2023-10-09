import path from 'path'
import type { PluginOption } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import compressionPlugin from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

function setupPlugins(env: ImportMetaEnv): PluginOption[] {
  return [
    vue(),
    env.VITE_GLOB_APP_PWA === 'true' && VitePWA({
      injectRegister: 'auto',
      manifest: {
        name: 'chatGPT',
        short_name: 'chatGPT',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
    compressionPlugin({
      threshold: 10240, // 大于10kb压缩
      algorithm: 'gzip',
    }),
  ]
}

export default defineConfig((env) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as ImportMetaEnv
  return {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    plugins: setupPlugins(viteEnv),
    server: {
      host: '0.0.0.0',
      port: 1002,
      open: false,
      proxy: {
        '/api': {
          target: viteEnv.VITE_GLOB_API_URL,
          changeOrigin: true, // 允许跨域
          rewrite: path => path.replace('/api/', '/'),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      reportCompressedSize: false,
      sourcemap: false,
      commonjsOptions: {
        ignoreTryCatch: false,
      },
    },
  }
})
