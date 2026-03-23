const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001', // This should be the port of your proxy server if you were running it separately
      changeOrigin: true,
    })
  );
};