import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from "react-router-dom";
import React from 'react';
import { UserProvider } from './context/UserContext.jsx';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider> 
     
      <BrowserRouter basename="/Front">
        <App />
        
        <Toaster 
          position="bottom-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />

      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);