export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: {
    enabled: false
  },
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
    '~/assets/styles/main.css'
  ],
  build: {
    transpile: ['vuetify']
  },
  modules: [],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api'
    }
  },
  vite: {
    optimizeDeps: {
      include: ['vuetify', 'vuetify/components', 'vuetify/directives'],
      exclude: ['@mdi/font']
    },
    ssr: {
      noExternal: ['vuetify']
    }
  }
})
