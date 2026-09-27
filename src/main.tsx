import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// PWA Service Worker
// Development: remove any old service worker so Vite/HMR works normally.
// Production: register service worker for PWA/offline support.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.DEV) {
      const registrations =
        await navigator.serviceWorker.getRegistrations();

      let hadController = Boolean(
        navigator.serviceWorker.controller
      );

      for (const registration of registrations) {
        await registration.unregister();
        hadController = true;
      }

      if (hadController) {
        window.location.reload();
      }

      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log(
          '[PWA] ServiceWorker registration successful:',
          registration.scope
        );
      })
      .catch((error) => {
        console.log(
          '[PWA] ServiceWorker registration failed:',
          error
        );
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);