import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; 
import { motion } from "framer-motion"; // 💡 สำหรับ Animation

// 💡 Icon "ลูกตา" (SVG)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const { setUser } = useUser(); 
  const navigate = useNavigate();

  // 🔥 Logic: handleSubmit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        username,
        password,
      });
      const token = res.data.token;
      localStorage.setItem("token", token); 

      const me = await axios.get("http://localhost:3000/api/protected/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (me.data.user) setUser(me.data.user); 
      navigate("/");
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message || "Login failed");
      } else {
        alert("Error connecting to server");
      }
    }
  };

  return (
    // 💡 Layout: พื้นหลังดำสนิท เข้ากับ MainLayout
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
      
      {/* 💡 Animation & Card Style */}
      <motion.div 
        className="w-full max-w-md p-8 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 space-y-8"
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-black text-white tracking-tight">
            <span className="text-sky-500">CYBER</span> LOGIN
          </h2>
          <p className="mt-2 text-gray-400">เข้าสู่ระบบเพื่อปลดล็อคจักรวาลใหม่</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Input Style: Username */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">USERNAME</label>
            <input
              id="username"
              type="text"
              // 🔥 Dark Input Style
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder-gray-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your unique codename"
            />
          </motion.div>

          {/* Input Style: Password + ลูกตา */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">PASSWORD</label>
            <div className="relative mt-1"> 
              <input
                id="password"
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access code"
              />
              {/* ปุ่มลูกตา */}
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-sky-400" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </div>
            </div>
          </motion.div>

          {/* Submit Button (Gradient) */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit" 
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-xl transition-all duration-300
                       bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 
                       focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            LOGIN TO SYSTEM
          </motion.button>
        </form>

        {/* Divider (Dark) */}
        <div className="relative flex items-center justify-center my-6">
          <span className="absolute inset-x-0 h-px bg-gray-700"></span>
          <span className="relative bg-gray-900 px-4 text-sm text-gray-500">AUTHENTICATION</span>
        </div>

        {/* Socials (Minimal Dark) */}
        <div className="grid grid-cols-3 gap-4">
          <button className="flex-1 py-3 px-3 border border-gray-700 rounded-xl shadow-md flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-800 transition-colors">
            <img src="/img/google.svg" alt="google" className="w-5 h-5" />
            <span className="hidden sm:inline">Google</span>
          </button>
          <button className="flex-1 py-3 px-3 border border-gray-700 rounded-xl shadow-md flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-800 transition-colors">
            <img src="/img/facebook.svg" alt="facebook" className="w-5 h-5" />
            <span className="hidden sm:inline">Meta</span>
          </button>
          <button className="flex-1 py-3 px-3 border border-gray-700 rounded-xl shadow-md flex items-center justify-center gap-2 text-gray-400 hover:bg-gray-800 transition-colors">
            <img src="/img/apple.svg" alt="apple" className="w-5 h-5" />
            <span className="hidden sm:inline">Apple</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Need access credentials?{' '}
          <Link to="/auth/register" className="font-medium text-sky-500 hover:text-sky-400 no-underline">
            Request Access
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;