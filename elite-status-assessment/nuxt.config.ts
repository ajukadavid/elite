// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: ['@/assets/css/tailwind.css'],
  app: {
    head: {
      title: 'Elite Status Assessment',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0b0b0f' },
        { name: 'description', content: 'A modern, luxury-feel personality quiz assessing social sophistication.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' }
      ]
    }
  }
})
