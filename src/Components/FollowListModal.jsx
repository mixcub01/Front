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
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" // 💡 (z-index สูง)
        onClick={onClose}
      >
        {/* 2. "Modal Card" (กล่องรายชื่อ) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-sm m-4 h-[60vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <h3 className="text-center text-lg font-semibold p-4 border-b border-zinc-200 capitalize">
            {title} {/* ⬅️ (โชว์ "Followers" หรือ "Following") */}
          </h3>

          {/* List (Scroll) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            
            {/* 3. "เช็ค" (ถ้าไม่มีคน...) */}
            {(!users || users.length === 0) ? (
              <p className="text-center text-gray-500 pt-10">No users found.</p>
            ) : (
              // 4. "วนลูป" (ถ้ามีคน...)
              users.map(user => (
                // 💡💡 --- "นี่ไง!" (โค้ดที่มึงถามหา!) --- 💡💡
                <Link 
                  to={`/profile/${user._id}`} // ⬅️ (คลิก... ไปโปรไฟล์คนนั้น)
                  key={user._id}
                  onClick={onClose} // ⬅️ (กด "ใน" ก็ปิด)
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors no-underline"
                >
                  <img src={user.avatar || '/img/avatar.png'} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-zinc-800">{user.username}</span>
                    <span className="text-xs text-gray-500">{user.fullName}</span>
                  </div>
                </Link>
                // 💡💡 --- สิ้นสุด --- 💡💡
              ))
            )}
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}