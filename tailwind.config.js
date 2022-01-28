module.exports = {
  mode: 'jit',
  content: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  darkMode: 'media',
  theme: {
    extend: {
      boxShadow: {
        'memo': '0 0 15pt 2pt rgba(0, 0, 0, 0.25)'
      },
      fontFamily: {
        'mono': ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
