import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import { OurAuth0Provider } from './components/Auth0Provider'
import { RouterWithAuth } from './components/RouterWithAuth'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <OurAuth0Provider>
      <RouterWithAuth />
    </OurAuth0Provider>
  </React.StrictMode>,
)
