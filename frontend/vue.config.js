const { defineConfig } = require('@vue/cli-service')
const apiProxyPrefix = '/api1';
const apiPort = process.env.VUE_APP_APP_PORT || '3000';
const apiProxyTarget = `http://localhost:${apiPort}`;

module.exports = defineConfig({
  transpileDependencies: true,
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
})
