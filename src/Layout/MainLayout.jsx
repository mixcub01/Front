import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";

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
  // ⚠️ State จำลอง
  const [unreadCount, setUnreadCount] = useState(3); 
  
  // Handle Scroll (เช็คว่าเลื่อนจอหรือยัง เพื่อปรับ Header)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); 

  // Handle Click Outside (ปิดเมนูเมื่อคลิกที่อื่น)
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
      // 💡 Logic ปิด Noti Modal
      // (Mocked: NotificationModal ต้องถูกปิดด้วย)
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

  // ✨ Styles ขั้นเทพ
  const navLinkClass = ({ isActive }) => `
    relative px-3 py-2 text-sm font-medium transition-all duration-300
    ${isActive 
      ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' 
      : 'text-slate-400 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'}
  `;

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a]"> {/* พื้นหลัง Dark Slate */}
      
      {/* 🔥 Header เทพเจ้า Glassmorphism */}
      <header className={`
          fixed top-0 w-full z-50 
          transition-all duration-500 ease-in-out
          border-b border-white/5
          ${scrolled 
            ? 'bg-[#0f172a]/80 backdrop-blur-xl py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]' 
            : 'bg-transparent py-5'}
      `}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-row justify-between items-center">
            
            {/* 1. LOGO (มีแสงเรืองๆ) */}
            <Link to="/" className="flex-shrink-0 group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <img 
                src="/img/log0.png" 
                alt="logo" 
                className={`relative rounded-full transition-all duration-500 object-cover border-2 border-white/10
                  ${scrolled ? 'w-10 h-10' : 'w-12 h-12'}
                `} 
              />
            </Link>

            {/* 2. Desktop Search Bar (Cyberpunk Style) */}
            <div className="hidden md:block flex-1 max-w-md mx-8 relative group" ref={searchRef}> 
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
              
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text"
                  placeholder="Search inspiration..."
                  className="w-full py-2.5 pl-5 pr-12 rounded-full bg-[#1e293b] text-gray-200 placeholder-gray-500 border border-white/10 focus:outline-none focus:bg-[#0f172a] transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-sky-500/10 rounded-full text-sky-400 hover:text-white hover:bg-sky-500 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-full mt-2 z-50"
                  >
                    <div className="bg-[#1e293b]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
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
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/Recipe" className={navLinkClass}>Recipe</NavLink>
              <NavLink to="/chat" className={navLinkClass}>Chat</NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>About</NavLink>
            </nav>

            {/* 4. Desktop Auth/Noti Button Group */}
            <div className="hidden md:flex w-auto ml-6 items-center gap-4">
              
              {user ? (
                // 💡 แก้ไข: หุ้มด้วย DIV แทน Fragment เพื่อแก้บั๊ก JSX
                <div className="flex items-center gap-4"> 
                    {/* AVATAR LINK (1st item) */}
                    <Link to="/User" className="relative group">
                        <img 
                            src={user.avatar || 'https://i.pravatar.cc/150?img=49'} 
                            alt={user.username} 
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-500/0 group-hover:ring-sky-500/50 transition-all duration-300" 
                        />
                    </Link>

                    {/* NOTIFICATION BELL (2nd item) */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsNotiModalOpen(true)}
                        className="p-2 rounded-full text-slate-400 hover:text-sky-400 hover:bg-white/10 transition-colors relative"
                        title="Notifications"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        
                        {/* Badge Count (ตัวเลขสีแดง) */}
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-900 bg-rose-500 text-xs text-white flex items-center justify-center p-2">
                            <span className="sr-only">{unreadCount} unread notifications</span>
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* SIGN OUT BUTTON (3rd item) */}
                    <button 
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>
              ) : (
                <Link 
                    to="/auth/login"
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign In
                </Link>
              )}
            </div>


            {/* 5. Mobile Burger Button */}
            <button
              ref={burgerButtonRef}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
                ) : (
                  <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
                )}
              </svg>
            </button>
        </div>

        {/* 6. Mobile Menu (Glassmorphism Dropdown) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden absolute top-full left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                    <input 
                    type="text"
                    placeholder="Search posts..."
                    className="w-full py-3 px-5 rounded-xl bg-[#1e293b] text-white border border-white/10 focus:border-sky-500 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                </form>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-2">
                    {['Home', 'Recipe', 'Chat', 'About', 'Me'].map((item) => (
                        <NavLink 
                            key={item}
                            to={item === 'Home' ? '/' : item === 'Me' ? '/User' : `/${item}`} 
                            onClick={handleMobileLinkClick}
                            className={({ isActive }) => `
                                px-4 py-3 rounded-xl text-lg font-medium transition-all
                                ${isActive ? 'bg-sky-500/10 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {item}
                        </NavLink>
                    ))}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-white/10">
                    {user ? (
                    <button 
                        className="w-full py-3 rounded-xl bg-rose-600 text-white font-bold shadow-lg active:scale-95 transition-transform"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                    ) : (
                    <Link 
                        to="/auth/login"
                        className="block w-full py-3 text-center rounded-xl bg-sky-600 text-white font-bold shadow-lg active:scale-95 transition-transform"
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
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20"> {/* เว้นที่ให้ Header แบบ Fixed */}
        <Outlet />
      </main>

      {/* Footer Minimalist */}
      <footer className="bg-[#0f172a] border-t border-white/5 text-slate-500 py-8 text-center">
        <div className="max-w-7xl mx-auto px-4">
            <p className="text-sm font-light tracking-wide">
                © 2025 <span className="text-sky-500 font-semibold">Mix-Cub</span>. Designed for the Future.
            </p>
        </div>
      </footer>
      
      {/* 💡 Modal แจ้งเตือน (ต้องวางไว้ข้างนอก Layout เพื่อให้ลอยเหนือทุกอย่าง) */}
      <AnimatePresence>
        {isNotiModalOpen && (
          <NotificationModal 
            onClose={() => {
              setIsNotiModalOpen(false);
              setUnreadCount(0); // 💡 เมื่อปิด Modal ถือว่าอ่านแล้ว
            }} 
            // ⚠️ ต้องส่ง unreadCount (State) ไปที่ Modal ด้วย
            initialUnreadCount={unreadCount} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}