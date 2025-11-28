import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; 
import { motion } from "framer-motion"; 

// --- Icons ---
const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

// Social Icons
const GoogleIcon = () => (<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>);
const FacebookIcon = () => (<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
const AppleIcon = () => (<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.24-1.62 4.11-1.62 1.35.06 2.51.79 3.29 1.97-2.94 1.71-2.46 5.95.42 7.15-.58 1.45-1.31 2.86-2.9 4.73zM12.03 5.31c-.44-2.37 1.97-4.27 4.16-4.3.38 2.51-2.37 4.52-4.16 4.3z"/></svg>);

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const { setUser } = useUser(); 
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("https://back-yzvd.onrender.com/api/auth/login", {
        username,
        password,
      });
      const token = res.data.token;
      localStorage.setItem("token", token); 

      const me = await axios.get("https://back-yzvd.onrender.com/api/protected/me", {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#ece4d4] font-sans overflow-hidden">
      
      {/* ================= LEFT SIDE: IMAGE (Desktop) ================= */}
      <div className="hidden lg:flex w-1/2 relative bg-[#33691e] items-center justify-center overflow-hidden shadow-2xl z-10">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop')" }}></div>
        
        {/* Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-[#33691e] to-[#1a330a] opacity-90"></div>
        
        {/* Decorative Circle */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#ffc857] rounded-full blur-[120px] opacity-40"></div>

        {/* Content Text */}
        <div className="relative z-10 p-16 text-[#ece4d4] max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <span className="inline-block py-1 px-3 rounded-full border border-[#ffc857]/30 bg-[#ffc857]/10 text-[#ffc857] text-xs font-bold tracking-widest uppercase mb-6">Community</span>
                <h1 className="text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                    Cook.<br/>
                    <span className="text-[#ffc857]">Share.</span><br/>
                    Eat.
                </h1>
                <p className="text-xl font-medium text-[#ece4d4]/70 mb-8 max-w-md leading-relaxed">
                    Join thousands of food lovers sharing their culinary masterpieces every day.
                </p>
            </motion.div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: FORM (Desktop & Mobile) ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-[#ece4d4]">
        
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#33691e_0.5px,transparent_0.5px)] [background-size:20px_20px] pointer-events-none"></div>

        {/* Card Container */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-[#33691e]/10 border border-[#33691e]/5 relative z-10"
        >
            {/* Header (เอา Icon ออกแล้ว ✅) */}
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#33691e] tracking-tight mb-2">Welcome Back!</h2>
                <p className="text-[#33691e]/50 font-medium">Please enter your details to sign in.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Username */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#33691e] uppercase tracking-widest ml-1">Username</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#33691e]/30 group-focus-within:text-[#ffc857] transition-colors">
                            <MailIcon className="w-5 h-5" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-4 bg-[#faf9f6] text-[#33691e] rounded-xl border-2 border-transparent focus:border-[#ffc857] focus:bg-white outline-none transition-all font-bold placeholder-[#33691e]/30" 
                            placeholder="Enter username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-[#33691e] uppercase tracking-widest">Password</label>
                        <a href="#" className="text-xs font-bold text-[#ffc857] hover:text-[#e6b44d] transition-colors">Forgot Password?</a>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#33691e]/30 group-focus-within:text-[#ffc857] transition-colors">
                            <LockIcon className="w-5 h-5" />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full pl-12 pr-12 py-4 bg-[#faf9f6] text-[#33691e] rounded-xl border-2 border-transparent focus:border-[#ffc857] focus:bg-white outline-none transition-all font-bold placeholder-[#33691e]/30" 
                            placeholder="Enter password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#33691e]/30 hover:text-[#33691e] cursor-pointer transition-colors"
                        >
                            {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-4 bg-[#ffc857] text-[#33691e] rounded-xl font-black text-lg shadow-lg shadow-[#ffc857]/30 hover:bg-[#e6b44d] hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2 group"
                >
                    {isLoading ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>
                            SIGN IN 
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </motion.button>

            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-[#33691e]/10 flex-1"></div>
                <span className="text-[#33691e]/40 text-[10px] font-bold uppercase tracking-widest">Or login with</span>
                <div className="h-px bg-[#33691e]/10 flex-1"></div>
            </div>

            {/* Social Buttons (Full width Grid) */}
            <div className="grid grid-cols-3 gap-3">
                <button className="flex items-center justify-center py-3.5 border-2 border-[#33691e]/5 rounded-xl hover:bg-white hover:border-[#33691e]/20 hover:shadow-md transition-all bg-[#faf9f6]">
                    <GoogleIcon />
                </button>
                <button className="flex items-center justify-center py-3.5 border-2 border-[#33691e]/5 rounded-xl hover:bg-white hover:border-[#33691e]/20 hover:shadow-md transition-all bg-[#faf9f6]">
                    <FacebookIcon />
                </button>
                <button className="flex items-center justify-center py-3.5 border-2 border-[#33691e]/5 rounded-xl hover:bg-white hover:border-[#33691e]/20 hover:shadow-md transition-all bg-[#faf9f6] text-[#33691e]">
                    <AppleIcon />
                </button>
            </div>

            {/* Footer Link */}
            <div className="mt-8 text-center">
                <p className="text-[#33691e]/60 font-medium text-sm">
                    Don't have an account?{' '}
                    <Link to="/auth/register" className="text-[#33691e] font-black hover:text-[#ffc857] transition-colors underline decoration-2 underline-offset-4 decoration-[#ffc857]/50 hover:decoration-[#ffc857]">
                        Create free account
                    </Link>
                </p>
            </div>

        </motion.div>
      </div>
    </div>
  );
}

export default Login;