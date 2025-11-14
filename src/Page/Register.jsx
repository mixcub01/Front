import React, { useState, useEffect } from "react"; // 💡 1. Import React (ตัวแม่) + useEffect
import axios from "axios";
// ❌ (ลบ "import ./Register.css"; ทิ้งไปเลย!)
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // 💡 2. Import Framer Motion

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
// 💡 4. สร้าง "Spinner" (วงกลมหมุน)
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


function Register() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); // 💡 "โปร" FIX: ใช้ State คุม "ลูกตา"
  const [isLoading, setIsLoading] = useState(false); // 💡 "โปร" FIX: State ปุ่ม Loading
  const [successMsg, setSuccessMsg] = useState(''); // 💡 "โปร" FIX: Toast Success
  const [errorMsg, setErrorMsg] = useState(''); // 💡 "โปร" FIX: Toast Error
  const navigate = useNavigate();

  // 💡 "โปร" FIX: Timer ปิด Toast + เด้งไปหน้า Login
  useEffect(() => {
    let errorTimer;
    if (errorMsg) {
      errorTimer = setTimeout(() => setErrorMsg(''), 3000); // 3 วิ ปิด
    }
    
    let successTimer;
    if (successMsg) {
      successTimer = setTimeout(() => {
        setSuccessMsg('');
        navigate('/auth/login'); // 💡 "เด้ง" ไปหน้า Login!
      }, 2000); // 2 วิ ปิด
    }
    
    return () => { // (เคลียร์ Timer ถ้า Component พังก่อน)
      clearTimeout(errorTimer);
      clearTimeout(successTimer);
    };
  }, [errorMsg, successMsg, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💡 "โปร" FIX: แก้ handleSubmit (Register -> เด้งไป Login)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await axios.post('https://backend-ai-uv1c.onrender.com/api/auth/register', formData);
      
      setSuccessMsg(response.data.message || "Registration successful!");
      setFormData({ username: '', fullName: '', email: '', password: '' }); // reset form

    } catch (error) {
      console.error('Register failed:', error.response?.data || error.message);
      setErrorMsg(error.response?.data?.message || 'Register failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 💡 5. "Layout โปร" (พื้นหลัง Gradient + จัดกลาง)
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200 p-4">
      
      {/* 💡 "โปร" FIX: "Toast" (Popup) "เทพ" */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 p-4 rounded-lg shadow-lg bg-red-600 text-white z-50"
          >
            <strong>Error:</strong> {errorMsg}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 p-4 rounded-lg shadow-lg bg-green-600 text-white z-50"
          >
            <strong>Success:</strong> {successMsg} (กำลังเด้งไปหน้า Login...)
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 💡 6. "Animation เทพ" (การ์ดลอยลงมา) */}
      <motion.div 
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-6"
        initial={{ opacity: 0, y: -30 }} // ⬅️ เริ่ม (ล่องหน + อยู่ข้างบน)
        animate={{ opacity: 1, y: 0 }} // ⬅️ จบ (โผล่ + เลื่อนลงมา)
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join us today!</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.fullName}
          	  onChange={handleChange}
          	  placeholder="Enter your full name"
              required
          	/>
          </div>
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
t              value={formData.username}
          	  onChange={handleChange}
          	  placeholder="Enter username"
              required
          	/>
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
          	  name="email"
          	  type="email"
          	  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          	  value={formData.email}
          	  onChange={handleChange}
          	  placeholder="Enter your email"
              required
          	/>
          </div>

          {/* Password + "ลูกตา" */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative mt-1"> 
              <input
          	    id="password"
                name="password"
          	    type={showPassword ? "text" : "password"} // 💡 7. "โปร" FIX (ใช้ State)
          	    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          	    value={formData.password}
          	    onChange={handleChange}
          	    placeholder="Enter password"
                required
          	  />
              <div 
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500 hover:text-gray-700" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>

          {/* Submit Button (มี Loading) */}
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 disabled:bg-gray-400"
            disabled={isLoading} // 💡 8. "ปิด" ปุ่มตอน Loading
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Spinner />
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 no-underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;