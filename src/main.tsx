import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "leaflet/dist/leaflet.css";
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { persistor, store } from './redux/store/Store.ts'
import { PersistGate } from 'redux-persist/integration/react'
// En main.jsx
import { registerSW } from 'virtual:pwa-register'

if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.log("Nueva versión disponible");
    },
    onOfflineReady() {
      console.log("Aplicación lista para trabajar sin conexión");
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <App />
      </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
