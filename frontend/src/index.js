import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // We renamed App.js to Main.js to fix the error

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);