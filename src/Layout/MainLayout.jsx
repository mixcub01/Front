import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import logoImage from '../assets/log0.png'
import useSearch from '../Hooks/useSearch';
import SearchSuggestions from '../Components/SearchSuggestions';
import { useUser } from "../context/UserContext";
import NotificationModal from '../Components/NotificationModal'; 


export default function MainLayout() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const dropdownRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null); 
  const { suggestions, loading } = useSearch(searchQuery);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const burgerButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [isNotiModalOpen, setIsNotiModalOpen] = useState(false); 
  const [unreadCount, setUnreadCount] = useState(3); 
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);  
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery("");
      }
      if (
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
        burgerButtonRef.current && !burgerButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, searchRef, mobileMenuRef, burgerButtonRef]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth/login");
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault(); 
    if (!searchQuery.trim()) return; 
    navigate(`/search?q=${searchQuery}`); 
    setSearchQuery("");
    setIsMobileMenuOpen(false);
  };
  
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // ✨ Styles: Nav Link แบบ Pill (เม็ดยา) ดู Modern Retro
  const navLinkClass = ({ isActive }) => `
    relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full
    ${isActive 
      ? 'bg-[#ffc857] text-[#33691e] shadow-md transform scale-105' 
      : 'text-[#33691e]/70 hover:text-[#33691e] hover:bg-[#33691e]/5'}
  `;

  return (
    <div className="flex flex-col min-h-screen bg-[#ece4d4]"> {/* พื้นหลังครีม */}
      
      {/* 🔥 Header Glassmorphism + Animation Slide Down */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={`
          fixed top-0 w-full z-50 
          transition-all duration-300 ease-in-out
          border-b border-[#33691e]/5
          ${scrolled 
            ? 'bg-[#ece4d4]/90 backdrop-blur-md py-3 shadow-lg shadow-[#33691e]/5' 
            : 'bg-[#ece4d4]/50 backdrop-blur-sm py-4'}
      `}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-row justify-between items-center">
            
            {/* 1. LOGO */}
            <Link to="/" className="flex-shrink-0 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ffc857] to-[#33691e] rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
              <img 
                src={logoImage} 
                alt="logo" 
                className={`relative rounded-full transition-all duration-500 object-cover border-2 bg-[#f0cf8e] border-[#33691e]/10 shadow-sm
                  ${scrolled ? 'w-10 h-10' : 'w-12 h-12'}
                `} 
              />
            </Link>

            {/* 2. Desktop Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-8 relative group" ref={searchRef}> 
              <form onSubmit={handleSearch} className="relative transform transition-all duration-300 group-hover:scale-[1.02]">
                <input 
                  type="text"
                  placeholder="Search inspiration..."
                  className="w-full py-2.5 pl-5 pr-12 rounded-full bg-[#ffc857] text-[#33691e] placeholder-[#33691e]/50 border-2 border-transparent focus:border-[#33691e]/20 focus:outline-none transition-all duration-300 shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#33691e] rounded-full text-[#ffc857] hover:bg-[#264f16] hover:scale-110 transition-all duration-300 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </form>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-full mt-3 z-50"
                  >
                    <div className="bg-[#ece4d4] border border-[#33691e]/10 rounded-2xl shadow-2xl overflow-hidden text-[#33691e]">
                        <SearchSuggestions 
                            suggestions={suggestions} 
                            loading={loading}
                            onSelect={() => setSearchQuery("")}
                        />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/Recipe" className={navLinkClass}>Recipe</NavLink>
              <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
            </nav>

            {/* 4. Desktop Auth/Noti Group */}
            <div className="hidden md:flex w-auto ml-6 items-center gap-4">
              
              {user ? (
                <div className="flex items-center gap-4"> 
                    {/* AVATAR */}
                    <Link to="/User" className="relative group">
                        <div className="p-0.5 rounded-full border-2 border-[#ffc857] group-hover:border-[#33691e] transition-colors">
                            <img 
                                src={user.avatar || 'https://i.pravatar.cc/150?img=49'} 
                                alt={user.username} 
                                className="w-8 h-8 rounded-full object-cover" 
                            />
                        </div>
                    </Link>

                    {/* NOTIFICATION BELL */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsNotiModalOpen(true)}
                        className="p-2 rounded-full text-[#33691e] hover:bg-[#ffc857] hover:text-[#33691e] transition-all duration-300 relative"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc857] text-[10px] font-bold text-[#33691e] ring-2 ring-[#ece4d4]">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* SIGN OUT BUTTON */}
                    <button 
                        className="px-5 py-2 rounded-full bg-[#33691e] text-[#ece4d4] text-sm font-bold shadow-lg hover:bg-[#264f16] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
              ) : (
                <Link 
                    to="/auth/login"
                    className="px-6 py-2 rounded-full bg-[#33691e] text-[#ece4d4] font-bold shadow-lg hover:bg-[#264f16] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Action Group */}
            <div className="flex items-center md:hidden gap-3">
              {user && (
                <button 
                  onClick={() => setIsNotiModalOpen(true)}
                  className="p-2 rounded-full text-[#33691e] bg-[#ffc857]/20 hover:bg-[#ffc857] transition-colors relative"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#ffc857] ring-2 ring-[#ece4d4]"></span>
                  )}
                </button>
              )}

              {/* Mobile Burger */}
              <button
                ref={burgerButtonRef}
                className="p-2 rounded-lg text-[#33691e] hover:bg-[#33691e]/10 transition-colors relative z-50"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {isMobileMenuOpen ? (
                    <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
                  ) : (
                    <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
                  )}
                </svg>
              </button>
            </div>
            
        </div>

        {/* 6. Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="md:hidden absolute top-full left-0 w-full bg-[#ece4d4] border-b border-[#33691e]/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                    <input 
                    type="text"
                    placeholder="Search..."
                    className="w-full py-3 px-5 rounded-2xl bg-[#ffc857] text-[#33691e] placeholder-[#33691e]/50 focus:outline-none focus:ring-2 focus:ring-[#33691e]/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#33691e] hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                </form>

                <nav className="flex flex-col gap-2">
                  {/* ✅ แก้ไข: เปลี่ยน About เป็น Dashboard */}
                  {['Home', 'Recipe', 'Chat', 'Dashboard', 'Me'].map((item) => (
                      <NavLink 
                          key={item}
                          // ✅ แก้ไข: Mapping Path ให้ตรง
                          to={
                            item === 'Home' ? '/' : 
                            item === 'Me' ? '/User' : 
                            item === 'Dashboard' ? '/dashboard' : 
                            item === 'Chat' ? '/chat' :
                            `/${item}`
                          } 
                          onClick={handleMobileLinkClick}
                          className={({ isActive }) => `
                              px-5 py-3 rounded-xl text-lg font-black tracking-wide transition-all
                              ${isActive 
                                ? 'bg-[#33691e] text-[#ffc857] shadow-md translate-x-2' 
                                : 'text-[#33691e]/60 hover:text-[#33691e] hover:bg-[#33691e]/5'}
                          `}
                      >
                          {item}
                      </NavLink>
                  ))}
                </nav>

                <div className="pt-4 border-t border-[#33691e]/10">
                    {user ? (
                    <button 
                        className="w-full py-3 rounded-xl bg-[#33691e] text-[#ece4d4] font-bold shadow-lg active:scale-95 transition-transform"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                    ) : (
                    <Link 
                        to="/auth/login"
                        className="block w-full py-3 text-center rounded-xl bg-[#33691e] text-[#ece4d4] font-bold shadow-lg active:scale-95 transition-transform"
                        onClick={handleMobileLinkClick}
                    >
                        Sign In
                    </Link>
                    )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 pt-24"> 
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#ece4d4] border-t border-[#33691e]/10 text-[#33691e]/60 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
            <div className="w-10 h-1 bg-[#ffc857] rounded-full mb-2"></div>
            <p className="text-sm font-medium tracking-wide">
                © 2025 <span className="text-[#33691e] font-black">Mix-Cub</span>. 
            </p>
            <p className="text-xs opacity-70">Designed for the Future.</p>
        </div>
      </footer>
      
      {/* Modal Notification */}
      <AnimatePresence>
        {isNotiModalOpen && (
          <NotificationModal 
            onClose={() => {
              setIsNotiModalOpen(false);
              setUnreadCount(0); 
            }} 
            initialUnreadCount={unreadCount} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}