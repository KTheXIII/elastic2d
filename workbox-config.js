module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{png,yml,html,json,jpg,js,css}'
  ],
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/
  ],
  swDest: 'build/service-worker.js',
  runtimeCaching: [
    {
      urlPattern: /\.(css)$/,
      handler: 'CacheFirst',
    },
    {
      urlPattern: /\.(png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
    }
  ]
}
