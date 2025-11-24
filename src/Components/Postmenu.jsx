import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 💡 1. "รับ" Prop 'onDelete' (ฟังก์ชัน "ลบ" จากตัวแม่)
export default function PostMenu({ onDelete }) {
  // 💡 2. State (เปิด/ปิด Dropdown)
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // 💡 (ตัวจับ Ref)

  // 💡 3. "ท่าโปร" (คลิกข้างนอก... แล้วปิด Dropdown)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // 💡 4. ฟังก์ชัน "กดลบ" (ใน Dropdown)
  const handleDeleteClick = () => {
    setIsOpen(false); // 1. ปิด Dropdown
    onDelete();       
  };

  return (
    // 💡 5. "Container" (ต้อง 'relative' ... กัน Dropdown เพี้ยน)
    <div className="relative" ref={menuRef}>
      
      {/* 6. "ปุ่ม ..." (ตัวเปิด) */}
      <button
        onClick={() => setIsOpen(!isOpen)} // 💡 (สลับเปิด/ปิด)
        className="ml-auto text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
        title="Options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>

      {/* 7. "Dropdown" (ตัวลอย) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-40 
                       bg-white rounded-lg shadow-xl py-1 z-50 
                       text-black overflow-hidden border border-gray-200"
          >
            {/* 💡 8. "ปุ่มลบ" (ใน Dropdown) */}
            <button
              onClick={handleDeleteClick} // ⬅️ (เรียกฟังก์ชัน "กดลบ")
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              Delete Post
            </button>
            {}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}