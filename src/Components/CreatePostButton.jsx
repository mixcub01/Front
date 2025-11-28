import React from 'react';
import { motion } from 'framer-motion'; 

// 💡 ไอคอน "+"
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/><path d="M5 12h14"/>
  </svg>
);

export default function CreatePostButton({ onOpenModal }) {
  return (
    <motion.button
      onClick={onOpenModal} 
      // 🔥🔥🔥 STYLE: YELLOW & GREEN THEME 🔥🔥🔥
      // - พื้นหลังเหลือง (#ffc857)
      // - ตัวหนังสือ/ไอคอนเขียว (#33691e)
      // - เงาสีเขียวจางๆ
      className="fixed bottom-10 right-10 w-16 h-16 
                 bg-[#ffc857] text-[#33691e] rounded-2xl 
                 shadow-2xl shadow-[#33691e]/20 
                 hover:bg-[#e6b44d] hover:shadow-[#33691e]/40 hover:-translate-y-1
                 border border-[#33691e]/10
                 transition-all duration-300 
                 flex items-center justify-center 
                 transform active:scale-90 
                 focus:outline-none focus:ring-4 focus:ring-[#ffc857]/50 
                 group z-40"
      // 🔥 ANIMATION: เด้งดึ๋ง
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      title="Create New Post"
    >
      {/* 💡 ไอคอนหมุนได้ (ตัดสี Sky ออก ใช้สีเขียวจาก Parent แทน) */}
      <span className="transition-transform duration-500 group-hover:rotate-90">
        <PlusIcon />
      </span>
    </motion.button>
  );
}