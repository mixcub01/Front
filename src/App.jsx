import React, { useState } from "react"; // 💡 แก้บรรทัดนี้!
import "./App.css";
import { Routes, Route, Link, Outlet } from "react-router-dom";
import Login from "./Page/Login.jsx";
import Home from "./Page/Home.jsx";
import Register from "./Page/Register.jsx";
import GoogleCallback from "./Layout/GoogleCallback.jsx";

import AuthLayout from "./Layout/AuthLayout";
import MainLayout from "./Layout/MainLayout";
import Chat from "./Page/Chat.jsx";
import User from "./Page/User.jsx";
import Dashboard from "./Page/Dashboard.jsx";
import UserProfile from "./Page/UserProfile.jsx"; 
import SearchPage from "./Page/SearchPage.jsx"; 
// เพิ่มเข้ามาใหม่
import RecipeGenerator from "./Page/RecipeGenerator.jsx";

function App() {
  return (
    <Routes>
      {/* layout สำหรับ main */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="chat" element={<Chat />} />
        <Route path="user" element={<User />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="/profile/:userId" element={<UserProfile />} />    
        <Route path="/search" element={<SearchPage />} />
        <Route path="/recipe" element={<RecipeGenerator />} />
      </Route>

   

      {/* layout สำหรับ auth */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="google/callback" element={<GoogleCallback />} />
      </Route>
    </Routes>
  );
}

export default App;