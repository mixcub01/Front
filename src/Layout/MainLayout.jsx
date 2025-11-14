import React, { useState, useEffect, useRef } from 'react'; // 💡 (ยืนยันว่ามี 'useRef')
// ...
import { motion, AnimatePresence } from 'framer-motion'; 
import useSearch from '../Hooks/useSearch'; // 💡💡 1. "Import" สมอง (Hook) 💡💡
import SearchSuggestions from '../Components/SearchSuggestions';
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function MainLayout() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState("");

const searchRef = useRef(null); // (ตัวจับ Search Bar)
  const { suggestions, loading } = useSearch(searchQuery);

  // 💡 2. "เพิ่ม" State (สำหรับเก็บคำค้นหา)


  // (โค้ด useEffect 'handleScroll' ... ถูกต้องแล้ว)
  useEffect(() => {

      const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); 


useEffect(() => {
    const handleClickOutside = (event) => {
      // (อันนี้มึงมีแล้ว... สำหรับ Dropdown Profile)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); 
      }
      
      // 💡 "เพิ่ม" Logic นี้ (สำหรับ Search Bar)
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery(""); // (เคลียร์คำค้น + ปิด Dropdown)
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, searchRef]); // ⬅️ (Dependency 2 อัน... ถูกต้องแล้ว)



  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth/login");
  };

  // 💡 3. "เพิ่ม" Function (สำหรับกด "Enter")
  const handleSearch = (e) => {
    e.preventDefault(); 
    if (!searchQuery.trim()) return; 

    // "เด้ง" ไปหน้า Search (พร้อมคำค้นหา)
    navigate(`/search?q=${searchQuery}`); 
    setSearchQuery(""); // (เคลียร์ช่องค้นหา)
  };

  // (โค้ด 'baseLinkClass', 'btnBase' ... ถูกต้องแล้ว)
  const baseLinkClass = "relative block py-2 px-3 no-underline transition-colors duration-300 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:bg-sky-400 after:transition-all after:duration-300";
  const activeLinkClass = "text-sky-400 after:w-full"; 
  const inactiveLinkClass = "text-gray-300 hover:text-white after:w-0 hover:after:w-full"; 
  const btnBase = "py-2 px-5 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";


  return (
    <div className="flex flex-col min-h-screen bg-slate-100"> 
      
      <header className={`
          sticky top-0 z-50 
          flex flex-col md:flex-row justify-between items-center 
          gap-4 md:gap-0 
          bg-gray-900 text-white shadow-md 
          transition-all duration-300 ease-in-out 
          ${scrolled ? 'py-2 px-6 md:px-8' : 'py-4 px-4 md:px-8'} 
      `}>
        
        {/* LOGO */}
        <Link to="/" className={`transition-all duration-300 ${scrolled ? 'w-10 h-10' : 'w-12 h-12'}`}> 
          <img 
            src="/img/log0.png" 
            alt="logo" 
            className="w-full h-full rounded-full cursor-pointer transition-transform hover:scale-110" 
          />
        </Link>

        {/* 💡💡 4. "ยัด" Search Bar (ตรงกลาง) 💡💡 */}
        {/* (ซ่อนในมือถือ -> md:block) */}
{/* 💡💡 1. "ยัด" โค้ดก้อนนี้ (แทนอันเก่า) 💡💡 */}
<div className="flex-1 max-w-xs mx-4 hidden md:block relative" ref={searchRef}> 
  
  {/* (Form นี้มึงมีแล้ว... UI เหมือนเดิมเป๊ะ) */}
  <form onSubmit={handleSearch} className="relative">
    <input 
      type="text"
      placeholder="Search posts..."
      className="w-full py-2 px-4 rounded-full bg-gray-700 text-gray-200 placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-gray-600 transition-colors"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </button>
  </form>

  {/* 💡💡 2. "เพิ่ม" Dropdown (ที่มึงแยกไฟล์ไว้) 💡💡 */}
  <AnimatePresence>
    {searchQuery && ( // ⬅️ "ถ้า" มึงกำลังพิมพ์...
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <SearchSuggestions 
          suggestions={suggestions} 
          loading={loading}
          onSelect={() => setSearchQuery("")} // 💡 (พอกด... ให้เคลียร์)
        />
      </motion.div>
    )}
  </AnimatePresence>
</div>

        <nav>
          <ul className="flex flex-col md:flex-row list-none m-0 p-0 gap-2.5 w-full md:w-auto">
            <li><NavLink to="/" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Home</NavLink></li>
          	<li><NavLink to="/Recommended" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Recommended</NavLink></li>
          	<li><NavLink to="/about" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>About</NavLink></li>
          	<li><NavLink to="/User" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>Me</NavLink></li>
      	  </ul>
      	</nav>

        {/* BUTTONS (Sign In/Out) */}
        <div className="w-full md:w-auto">
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
    	</header>

    	<main className="flex-1">
      	<Outlet />
    	</main>

    	<footer className="bg-gray-800 text-gray-400 p-8 text-center">
      {/* ... (โค้ด Footer ของมึง) ... */}
    	</footer>
    </div>
  );
}