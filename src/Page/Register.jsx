import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; 


//  Icon "ลูกตา" (SVG)
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

// 💡 สร้าง "Spinner" (วงกลมหมุน)
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
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const [successMsg, setSuccessMsg] = useState(''); 
  const [errorMsg, setErrorMsg] = useState(''); 
  const navigate = useNavigate();

  // 💡 Logic: Timer ปิด Toast + เด้งไปหน้า Login
  useEffect(() => {
    let errorTimer;
    if (errorMsg) {
      errorTimer = setTimeout(() => setErrorMsg(''), 4000); // 4 วิ ปิด
    }
    
    let successTimer;
    if (successMsg) {
      successTimer = setTimeout(() => {
        setSuccessMsg('');
        navigate('/auth/login'); 
      }, 2500); // 2.5 วิ เด้งไป
    }
    
    return () => {
      clearTimeout(errorTimer);
      clearTimeout(successTimer);
    };
  }, [errorMsg, successMsg, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💡 Logic: handleSubmit (ไม่แตะต้อง Logic หลัก)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 🔥 ยิงไป Backend
      const response = await axios.post('http://localhost:3000/api/auth/register', formData);
      
      setSuccessMsg(response.data.message || "Account created successfully!");
      setFormData({ username: '', fullName: '', email: '', password: '' }); 

    } catch (error) {
      console.error('Register failed:', error.response?.data || error.message);
      setErrorMsg(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 💡 Layout: พื้นหลังดำสนิท เข้ากับ MainLayout
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
      
      {/* 💡 "Toast" (Popup) "เทพ" */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-6 right-6 p-4 rounded-xl shadow-xl bg-red-800/80 backdrop-blur-sm text-white border border-red-600 z-50"
          >
            <strong>❌ Error:</strong> {errorMsg}
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-6 right-6 p-4 rounded-xl shadow-xl bg-green-700/80 backdrop-blur-sm text-white border border-green-600 z-50"
          >
            <strong>✅ Success:</strong> {successMsg} (Redirecting...)
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 💡 Card Style */}
      <motion.div 
        className="w-full max-w-md p-8 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 space-y-8"
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-black text-white tracking-tight">
            <span className="text-rose-500">INITIATE</span> ACCESS
          </h2>
          <p className="mt-2 text-gray-400">สร้างบัญชีผู้ใช้งานใหม่ในระบบ</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Input Styles (ใช้โทน Dark/Sky) */}
          {[
            { id: 'fullName', label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Enter your full name' },
            { id: 'username', label: 'Username', name: 'username', type: 'text', placeholder: 'Enter unique codename' },
            { id: 'email', label: 'Email', name: 'email', type: 'email', placeholder: 'Enter secure email' },
          ].map((field, index) => (
            <motion.div key={field.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + index * 0.1 }}>
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-400 mb-1 uppercase">{field.label}</label>
              <input
                id={field.id}
                name={field.name}
                type={field.type}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder-gray-500"
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
              />
            </motion.div>
          ))}
          
          {/* Input Style: Password + ลูกตา */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1 uppercase">Password</label>
            <div className="relative mt-1"> 
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all placeholder-gray-500"
                value={formData.password}
                onChange={handleChange}
                placeholder="Set access code"
                required
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


          {/* Submit Button (Gradient + Loading) */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit" 
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-xl transition-all duration-300
                       bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 
                       focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-700 disabled:text-gray-500 disabled:shadow-none"
            disabled={isLoading} 
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Spinner />
                CREATING ACCESS...
              </span>
            ) : (
              "CREATE ACCOUNT"
            )}
          </motion.button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-500 pt-4 border-t border-gray-800">
          Already have access credentials?{' '}
          <Link to="/auth/login" className="font-medium text-sky-500 hover:text-sky-400 no-underline">
            Login to System
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;