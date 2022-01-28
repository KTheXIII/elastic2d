import snowpack from '@snowpack/web-test-runner-plugin'

process.env.NODE_ENV = 'test'

export default {
  plugins: [snowpack()],
}
