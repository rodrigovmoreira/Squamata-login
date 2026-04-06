import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from "@chakra-ui/react" // Padrão Chakra v3
import { AppProvider } from './context/AppContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider value={defaultSystem}>
        <AppProvider>
          <App />
        </AppProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
)