import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { StoreSettingsProvider } from './context/StoreSettingsContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreSettingsProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </StoreSettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
