import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './App'

async function main() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.querySelector('#root')
  )
}

window.onload = main

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) import.meta.hot.accept()

