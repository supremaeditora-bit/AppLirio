import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register Service Worker for Push Notifications
if ('serviceWorker' in navigator && 'PushManager' in window) {
  // Prevent registration in sandboxed iframes (like AI Studio preview)
  // by checking if the current window is the top-level window.
  if (window.self === window.top) {
    window.addEventListener('load', () => {
      const swUrl = `${window.location.origin}/sw.js`;
      navigator.serviceWorker.register(swUrl)
        .then(swReg => {
          console.log('Service Worker is registered', swReg);
        }).catch(err => {
          console.error('Service Worker Error', err);
        });
    });
  } else {
    console.log('Service Worker registration skipped: running in an iframe.');
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);