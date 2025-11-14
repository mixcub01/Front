import React, { useState } from "react"; // 💡 1. Import React (ตัวแม่)
import axios from "axios";
// ❌ (ลบ "import ./Login.css"; ทิ้งไปเลย!)
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; 
import { motion } from "framer-motion"; // 💡 2. Import Framer Motion (สำหรับ Animation)

// 💡 3. สร้าง Icon "ลูกตา" (SVG)
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
  // 💡 4. "โปร" FIX: ใช้ State คุม "ลูกตา" (ห้ามใช้ document.getElementById)
  const [showPassword, setShowPassword] = useState(false); 
  const { setUser } = useUser(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://backend-ai-uv1c.onrender.com/api/auth/login", {
        username,
        password,
      });
      const token = res.data.token;
      localStorage.setItem("token", token); 

      // fetch user info หลัง login
      const me = await axios.get("https://backend-ai-uv1c.onrender.com/api/protected/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (me.data.user) setUser(me.data.user); 
      navigate("/"); // 💡 (กลับไปหน้า Home ดีกว่า /user)
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message || "Login failed");
      } else {
        alert("Error connecting to server");
      }
    }
  };

  // ❌ (ลบ function togglePassword() กาก ๆ ทิ้งไป)

  return (
    // 💡 5. "Layout โปร" (พื้นหลัง Gradient + จัดกลาง)
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200 p-4">
      
      {/* 💡 6. "Animation เทพ" (การ์ดลอยลงมา) */}
      <motion.div 
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-6"
        initial={{ opacity: 0, y: -30 }} // ⬅️ เริ่ม (ล่องหน + อยู่ข้างบน)
        animate={{ opacity: 1, y: 0 }} // ⬅️ จบ (โผล่ + เลื่อนลงมา)
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Please enter your details</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={username}
          	  onChange={(e) => setUsername(e.target.value)}
          	  placeholder="Enter username"
          	/>
          </div>

          {/* Password + "ลูกตา" */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative mt-1"> {/* 💡 (หุ้มไว้... เพื่อใส่ Icon) */}
              <input
            	  id="password"
            	  type={showPassword ? "text" : "password"} // 💡 7. "โปร" FIX (ใช้ State)
            	  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            	  value={password}
          	  onChange={(e) => setPassword(e.target.value)}
          	  placeholder="Enter password"
          	/>
              {/* 💡 8. "ปุ่มลูกตา" (แบบ "โปร") */}
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500" />
              Remember me
            </label>
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 no-underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
          >
            Sign In
          </button>
        </form>

        {/* Divider (แบบ "โปร") */}
        <div className="relative flex items-center justify-center my-6">
          <span className="absolute inset-x-0 h-px bg-gray-300"></span>
          <span className="relative bg-white px-4 text-sm text-gray-500">or continue with</span>
      	</div>

        {/* Socials (แบบ "โปร") */}
        <div className="grid grid-cols-3 gap-3">
          <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <img src="/img/google.svg" alt="google" className="w-5 h-5" />
            <span>Google</span>
          </button>
          <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <img src="/img/facebook.svg" alt="facebook" className="w-5 h-5" />
          	<span>Facebook</span>
          </button>
          <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg shadow-sm flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <img src="/img/apple.svg" alt="apple" className="w-5 h-5" />
          	<span>Apple</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 no-underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;