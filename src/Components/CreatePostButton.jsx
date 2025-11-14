import React from 'react';

// 💡 1. "รับ" Prop 'onOpenModal' (ฟังก์ชัน) มาจากตัวแม่
export default function CreatePostButton({ onOpenModal }) {
  return (
    <button
      onClick={onOpenModal} 
      className="fixed bottom-10 right-3 w-16 h-16 
border-2 border-solid border-sky-500
bg-gray-900 text-white rounded-xl shadow-xl hover:bg-sky-500
               focus:ring-sky-500
                 rounded-full shadow-xl 
                 flex items-center justify-center 
                 text-4xl font-light 
                 transform transition-all duration-300 
                 
                 group // 💡 1. เพิ่ม 'group' (ตัวแม่)

                 hover:scale-110 hover:shadow-2xl active:scale-95 active:bg-zinc-800 
                 focus:outline-none focus:ring-4 focus:ring-zinc-500 focus:ring-opacity-50
                 " // ❌❌ กู "ลบ" ฟันหนู (") ที่เกินตรงนี้ทิ้งไปแล้ว! ❌❌
    >
      {/* 💡 2. "ห่อ" + ด้วย <span> แล้วสั่ง 'หมุน' (ตัวลูก) */}
      <span className="transition-transform duration-300 group-hover:rotate-90">
        +
      </span>
    </button>
  );
}