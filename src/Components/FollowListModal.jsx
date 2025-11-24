import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// 💡 1. "รับ" Prop 3 ตัว: title (ชื่อ), users (Array), onClose (ปุ่มปิด)
export default function FollowListModal({ title, users, onClose }) {
  return (
    <AnimatePresence>
      {/* 1. "Backdrop" (พื้นหลังมืด) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* 2. "Modal Card" (กล่องรายชื่อ) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          // 🔥 Dark Mode/Glass Style
          className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm m-4 h-[60vh] flex flex-col border border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
            <h3 className="text-xl font-bold text-white capitalize">
              {title} {/* ⬅️ (โชว์ "Followers" หรือ "Following") */}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* List (Scroll) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            
            {/* 3. "เช็ค" (ถ้าไม่มีคน...) */}
            {(!users || users.length === 0) ? (
              <p className="text-center text-gray-600 pt-10">
                ยังไม่มี {title.toLowerCase()} 
              </p>
            ) : (
              // 4. "วนลูป" (ถ้ามีคน...)
              users.map(user => (
                <Link 
                  to={`/profile/${user._id || user.id}`} // ⬅️ (คลิก... ไปโปรไฟล์คนนั้น)
                  key={user._id || user.id}
                  onClick={onClose} // ⬅️ (กด "ใน" ก็ปิด)
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors no-underline group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                        src={user.avatar || 'https://i.pravatar.cc/150?img=49'} 
                        alt={user.username} 
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-sky-500/30" 
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-white">{user.username}</span>
                      <span className="text-xs text-sky-400 group-hover:text-sky-300 transition-colors">{user.fullName}</span>
                    </div>
                  </div>
                  
                  {/* ปุ่ม Follow (Optional: ถ้าอยากให้ Follow ได้จากใน Modal) */}
                  <span className="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full border border-gray-600">
                    View
                  </span>
                </Link>
              ))
            )}
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}