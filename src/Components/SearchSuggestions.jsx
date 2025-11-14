import React from 'react';
import { Link } from 'react-router-dom';

// 💡 1. "รับ" Prop 3 ตัว:
//    suggestions (Array ที่จะโชว์)
//    loading (กำลังหมุนมั้ย)
//    onSelect (ฟังก์ชัน "ปิด" Dropdown ตอนมึงคลิก)
export default function SearchSuggestions({ suggestions, loading, onSelect }) {
  
  // 💡 (ท่า "โปร": ถ้าไม่มีผลลัพธ์ + ไม่ Loading -> ไม่ต้องโชว์กล่อง)
  if (!loading && suggestions.length === 0) {
     return (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 text-sm text-gray-500">No results found for this query.</div>
        </div>
     );
  }

  return (
    // 💡 2. "Dropdown" (กล่องลอย)
    <div className="absolute top-full mt-2 w-full 
                    bg-white rounded-lg shadow-lg 
                    border border-gray-200 
                    max-h-60 overflow-y-auto z-50
                  ">
      
      {loading && (
        <div className="p-3 text-sm text-gray-500">Loading suggestions...</div>
      )}

      {/* 3. "วนลูป" คำเดา */}
      {!loading && suggestions.length > 0 && (
        <ul>
          {suggestions.map(post => (
            <li key={post._id} className="border-b border-gray-100 last:border-b-0">
              {/* 💡 4. พอกด "คำเดา" -> "เด้ง" ไปหน้า '/search?q=...' */}
              <Link
                to={`/search?q=${post.text}`} // ⬅️ (ไปหน้า Search)
                onClick={onSelect} // ⬅️ (สั่ง "ปิด" Dropdown)
                className="block p-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors truncate"
              >
                {post.text}
              </Link>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}