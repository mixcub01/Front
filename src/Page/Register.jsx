import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; 

// --- Icons ---
const UserIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MailIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const LockIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const EyeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeOffIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>);
const ArrowRightIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>);

// Spinner สีเขียว (เพื่อให้ตัดกับปุ่มเหลือง)
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-[#33691e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

  // Logic Timer ปิด Toast
  useEffect(() => {
    let errorTimer;
    if (errorMsg) {
      errorTimer = setTimeout(() => setErrorMsg(''), 4000);
    }
    
    let successTimer;
    if (successMsg) {
      successTimer = setTimeout(() => {
        setSuccessMsg('');
        navigate('/auth/login'); 
      }, 2500);
    }
    
    return () => {
      clearTimeout(errorTimer);
      clearTimeout(successTimer);
    };
  }, [errorMsg, successMsg, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await axios.post('https://back-yzvd.onrender.com/api/auth/register', formData);
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
    <div className="flex min-h-screen w-full bg-[#ece4d4] font-sans overflow-hidden relative">
      
      {/* --- Toast Notifications (มุมขวาล่าง) --- */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl bg-white border-l-4 border-red-500 text-red-600 z-50 flex items-center gap-3"
          >
            <div className="bg-red-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg></div>
            <div>
                <p className="font-bold text-xs uppercase tracking-wider">Error</p>
                <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl bg-white border-l-4 border-[#33691e] text-[#33691e] z-50 flex items-center gap-3"
          >
            <div className="bg-[#33691e]/10 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div>
                <p className="font-bold text-xs uppercase tracking-wider">Success</p>
                <p className="text-sm font-medium">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= LEFT SIDE: IMAGE (Desktop) ================= */}
      <div className="hidden lg:flex w-1/2 relative bg-[#33691e] items-center justify-center overflow-hidden shadow-2xl z-10">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop')" }}></div>
        
        {/* Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#33691e] to-[#1a330a] opacity-90"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-[#ffc857] rounded-full blur-[100px] opacity-30"></div>

        {/* Content Text */}
        <div className="relative z-10 p-16 text-[#ece4d4] max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <span className="inline-block py-1 px-3 rounded-full border border-[#ffc857]/30 bg-[#ffc857]/10 text-[#ffc857] text-xs font-bold tracking-widest uppercase mb-6">Join Us</span>
                <h1 className="text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                    Start<br/>
                    Your<br/>
                    <span className="text-[#ffc857]">Journey.</span>
                </h1>
                <p className="text-xl font-medium text-[#ece4d4]/70 mb-8 max-w-md leading-relaxed">
                    Create an account to unlock exclusive recipes, connect with chefs, and save your favorites.
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
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-[#33691e] tracking-tight mb-2">Create Account</h2>
                <p className="text-[#33691e]/50 font-medium">Join the community today.</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#33691e] uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#33691e]/30 group-focus-within:text-[#ffc857] transition-colors">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <input 
                        id="fullName" name="fullName" type="text" 
                        className="w-full pl-12 pr-4 py-3.5 bg-[#faf9f6] text-[#33691e] rounded-xl border-2 border-transparent focus:border-[#ffc857] focus:bg-white outline-none transition-all font-bold placeholder-[#33691e]/30"
                        value={formData.fullName} onChange={handleChange} placeholder="John Doe" required 
                    />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#33691e] uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#33691e]/30 group-focus-within:text-[#ffc857] transition-colors">
                        <span className="text-lg font-black w-5 text-center">@</span>
                    </div>
                    <input 
                        id="username" name="username" type="text" 
                        className="w-full pl-12 pr-4 py-3.5 bg-[#faf9f6] text-[#33691e] rounded-xl border-2 border-transparent focus:border-[#ffc857] focus:bg-white outline-none transition-all font-bold placeholder-[#33691e]/30"
                        value={formData.username} onChange={handleChange} placeholder="chef_john" required 
                    />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#33691e] uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#33691e]/30 group-focus-within:text-[#ffc857] transition-colors">
                        <MailIcon className="w-5 h-5" />
                    </div>
                    <input 
                        id="email" name="email" type="email" 
                        className="w-full pl-12 pr-4 py-3.5 bg-[#faf9f6] text-[#33691e] rounded-xl border-2 border-transparent focus:border-[#ffc857] focus:bg-white outline-none transition-all font-bold placeholder-[#33691e]/30"
                        value={formData.email} onChange={handleChange} placeholder="john@example.com" required 
                    />
                </div>
              </div>
              
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#33691e] uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#33691e]/30 group-focus-within:text-[#ffc857] transition-colors">
                        <LockIcon className="w-5 h-5" />
                    </div>
                    <input 
                        id="password" name="password" type={showPassword ? "text" : "password"} 
                        className="w-full pl-12 pr-12 py-3.5 bg-[#faf9f6] text-[#33691e] rounded-xl border-2 border-transparent focus:border-[#ffc857] focus:bg-white outline-none transition-all font-bold placeholder-[#33691e]/30"
                        value={formData.password} onChange={handleChange} placeholder="Set password" required 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#33691e]/30 hover:text-[#33691e] cursor-pointer transition-colors">
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
                className="w-full py-4 bg-[#ffc857] text-[#33691e] rounded-xl font-black text-lg shadow-lg shadow-[#ffc857]/30 hover:bg-[#e6b44d] hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2"><Spinner /> Creating...</span>
                ) : (
                  <>CREATE ACCOUNT <ArrowRightIcon className="w-5 h-5" /></>
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
                <p className="text-[#33691e]/60 font-medium text-sm">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="text-[#33691e] font-black hover:text-[#ffc857] transition-colors underline decoration-2 underline-offset-4 decoration-[#ffc857]/50 hover:decoration-[#ffc857]">
                        Log in here
                    </Link>
                </p>
            </div>

        </motion.div>
      </div>
    </div>
  );
}

export default Register;