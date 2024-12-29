import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { WebSocketProvider } from './context/WebSocketContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WebSocketProvider>
    <App />
    </WebSocketProvider>
  </StrictMode>,
)