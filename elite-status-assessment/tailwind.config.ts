import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        ebony: '#0b0b0f',
        onyx: '#111214',
        gold: {
          400: '#e6c67a',
          500: '#d4af37',
          600: '#b8962e'
        }
      },
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell', 'Noto Sans', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        luxe: '0 10px 40px rgba(0,0,0,0.35)'
      }
    }
  }
}