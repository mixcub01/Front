import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 💡 1. "รับ" Prop 'onDelete'
export default function PostMenu({ onDelete }) {
  // 💡 2. State (เปิด/ปิด Dropdown)
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // 💡 3. คลิกข้างนอกปิดเมนู
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // 💡 4. ฟังก์ชัน "กดลบ"
  const handleDeleteClick = () => {
    setIsOpen(false); 
    onDelete();       
  };

  return (
    // 💡 5. "Container"
    <div className="relative" ref={menuRef}>
      
      {/* 6. "ปุ่ม ..." (ปรับสีให้เข้าธีม) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
            p-2 rounded-full transition-all duration-200
            ${isOpen 
                ? 'bg-[#ffc857] text-[#33691e] shadow-sm' // ตอนเปิด: พื้นเหลือง ตัวเขียว
                : 'text-[#33691e]/60 hover:text-[#33691e] hover:bg-[#33691e]/10' // ตอนปิด: สีจาง Hover แล้วเข้ม
            }
        `}
        title="Options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>

      {/* 7. "Dropdown" (Theme Cream & Forest) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-48 
                       bg-[#faf9f6] rounded-xl shadow-xl z-50 
                       border border-[#33691e]/10 overflow-hidden"
          >
            {/* 💡 8. "ปุ่มลบ" (มีไอคอนถังขยะ + สีแดง Rose) */}
            <button
              onClick={handleDeleteClick} 
              className="w-full text-left px-5 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              Delete Post
            </button>
            
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}