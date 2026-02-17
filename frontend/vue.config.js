const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const apiProxyPrefix = '/api1';
const apiPort = process.env.VUE_APP_APP_PORT || '3000';
const apiProxyTarget = `http://localhost:${apiPort}`;

const isProduction = process.env.NODE_ENV === 'production'
const enablePrerender = isProduction && process.env.ENABLE_PRERENDER !== '0'

const config = {
  transpileDependencies: true,
  parallel: false,
  devServer: {
    proxy: {
      [apiProxyPrefix]: {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
        pathRewrite: { [`^${apiProxyPrefix}`]: '' }
      }
    }
  }
}

// Prerender public landing pages at build time for SEO
if (enablePrerender) {
  try {
    const PrerendererWebpackPlugin = require('@prerenderer/webpack-plugin')
    config.configureWebpack = {
      plugins: [
        new PrerendererWebpackPlugin({
          routes: ['/login', '/signin'],
          renderer: '@prerenderer/renderer-puppeteer',
          rendererOptions: {
            renderAfterTime: 5000,
            headless: true
          },
          postProcess(renderedRoute) {
            // Ensure prerendered pages have correct meta
            renderedRoute.html = renderedRoute.html.replace(
              /<title>[^<]*<\/title>/,
              `<title>${renderedRoute.route === '/login' ? 'Login' : 'Sign Up'} - Jayden Art Auction</title>`
            )
            return renderedRoute
          }
        })
      ]
    }
  } catch (e) {
    console.warn('Prerenderer not available, skipping prerender:', e.message)
  }
}

module.exports = defineConfig(config)
