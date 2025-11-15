import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import useSearch from '../Hooks/useSearch';
import SearchSuggestions from '../Components/SearchSuggestions';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function MainLayout() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // (Profile)
  const dropdownRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null); // (Ref นี้... จะใช้สำหรับ Desktop Search)
  const { suggestions, loading } = useSearch(searchQuery);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const burgerButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // (โค้ด useEffect 'handleScroll')
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); 

  // (โค้ด useEffect 'handleClickOutside')
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


  // (โค้ด handleLogout, handleSearch)
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

  // (โค้ด baseLinkClass, btnBase ... ใส่เต็ม)
  const baseLinkClass = "relative block py-2 px-3 no-underline transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-sky-400 after:transition-all after:duration-300";
  const activeLinkClass = "text-sky-400 after:w-full"; 
  const inactiveLinkClass = "text-gray-300 hover:text-white after:w-0 hover:after:w-full"; 
  const btnBase = "py-2 px-5 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";


  return (
    <div className="flex flex-col min-h-screen bg-slate-100"> 
      
      <header className={`
          sticky top-0 z-50 
          flex flex-row justify-between items-center /* 💡 (นี่คือ "ท่า" ที่ถูกต้อง) */
          bg-gray-900 text-white shadow-md 
          transition-all duration-300 ease-in-out 
          ${scrolled ? 'py-2 px-6 md:px-8' : 'py-4 px-4 md:px-8'} 
          relative
      `}>
        
        {/* 💡 1. ก้อน 1: LOGO (ซ้ายสุด... เหมือนเดิม) */}
        <Link to="/" className={`flex-shrink-0 transition-all duration-300 ${scrolled ? 'w-10 h-10' : 'w-12 h-12'}`}> 
          <img 
            src="/img/log0.png" 
            alt="logo" 
            className="w-full h-full rounded-full cursor-pointer transition-transform hover:scale-110" 
          />
        </Link>

        {/* 💡 2. ก้อน 2: SEARCH BAR (Desktop... ซ่อนในมือถือ) */}
        {/* (นี่คือท่าเดิมของมึงเป๊ะๆ!) */}
        <div className="hidden md:block flex-1 max-w-xs mx-4 relative" ref={searchRef}> 
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text"
              placeholder="Search posts..."
              className="w-full py-2 px-4 rounded-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-gray-600 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SearchSuggestions 
                  suggestions={suggestions} 
                  loading={loading}
                  onSelect={() => setSearchQuery("")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 💡 3. ก้อน 3: NAV LINKS (Desktop... ซ่อนในมือถือ) */}
        <nav className="hidden md:block">
          <ul className="flex flex-row list-none m-0 p-0 gap-2.5">
            <li><NavLink to="/" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Home</NavLink></li>
            <li><NavLink to="/Recommended" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Recommended</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>About</NavLink></li>
            <li><NavLink to="/User" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Me</NavLink></li>
          </ul>
        </nav>

        {/* 💡 4. ก้อน 4: AUTH BUTTON (Desktop... ซ่อนในมือถือ) */}
        <div className="hidden md:block w-auto">
          {user ? (
            <button 
              className={`${btnBase} bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-400 w-full`}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          ) : (
            <Link 
                to="/auth/login"
                className={`${btnBase} bg-sky-500 text-white hover:bg-sky-400 focus:ring-sky-300 w-full block`}
            >
              Sign In
            </Link>
          )}
        </div>


        {/* 💡 5. "ปุ่ม Burger" (โชว์เฉพาะมือถือ) */}
        <button
          ref={burgerButtonRef}
          className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
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


        {/* 💡 6. "ก้อนเมนูมือถือ" (Dropdown... ซ่อนในจอคอม) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              className="md:hidden flex flex-col gap-4 absolute top-full left-0 w-full bg-gray-900 p-4 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* (Search Bar - Mobile) */}
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text"
                  placeholder="Search posts..."
                  className="w-full py-2 px-4 rounded-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-gray-600 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </form>

              {/* (Nav Links - Mobile) */}
              <nav>
                <ul className="flex flex-col list-none m-0 p-0 gap-2.5" onClick={handleMobileLinkClick}>
                  <li><NavLink to="/" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Home</NavLink></li>
                  <li><NavLink to="/Recommended" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Recommended</NavLink></li>
                  <li><NavLink to="/about" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>About</NavLink></li>
                  <li><NavLink to="/User" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Me</NavLink></li>
                </ul>
              </nav>

              {/* (Auth Buttons - Mobile) */}
              <div className="w-full">
                {user ? (
                  <button 
                    className={`${btnBase} bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-400 w-full`}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link 
                      to="/auth/login"
                      className={`${btnBase} bg-sky-500 text-white hover:bg-sky-400 focus:ring-sky-300 w-full block text-center`}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-gray-400 p-8 text-center">
        <p>© 2025 Mix-Cub. All rights reserved.</p>
      </footer>
    </div>
  );
}