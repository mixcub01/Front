import React from 'react';
import { motion } from 'framer-motion'; // 💡 Import motion

// 💡 ไอคอน "+" แบบโมเดิร์น
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14"/><path d="M5 12h14"/>
  </svg>
);


export default function CreatePostButton({ onOpenModal }) {
  return (
    <motion.button
      onClick={onOpenModal} 
      // 🔥🔥🔥 STYLE: CYBER NEON BUTTON 🔥🔥🔥
      className="fixed bottom-10 right-10 w-16 h-16 
                 bg-gray-800 text-white rounded-xl 
                 shadow-2xl shadow-sky-500/30 
                 hover:bg-sky-600 hover:shadow-sky-500/60 
                 transition-all duration-300 
                 flex items-center justify-center 
                 transform active:scale-90 
                 focus:outline-none focus:ring-4 focus:ring-sky-500/50 
                 group z-40"
      // 🔥 ANIMATION: เด้งดึ๋งๆ ตอนโหลด
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      title="Create New Post"
    >
      {/* 💡 ไอคอนหมุนได้ */}
      <span className="transition-transform duration-500 group-hover:rotate-180 text-sky-400 group-hover:text-white">
        <PlusIcon />
      </span>
    </motion.button>
  );
}