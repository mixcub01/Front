import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from "react-router-dom";
import React from 'react';
import { UserProvider } from './context/UserContext.jsx';
import { Toaster } from 'react-hot-toast'; // 💡💡 1. "Import" Toaster เข้ามา! 💡💡

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider> 
      <BrowserRouter>
        <App />
        
    
        <Toaster 
          position="bottom-right" // ⬅️ "โปร" (มุมขวาล่าง)
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333', // ⬅️ สี "โปร" (ดำ)
              color: '#fff',
            },
          }}
        />

      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);