import React from 'react';
import { Link } from 'react-router-dom';

// 💡 1. "รับ" Prop 3 ตัว:
export default function SearchSuggestions({ suggestions, loading, onSelect }) {
  
  // 💡 (ท่า "โปร": ถ้าไม่มีผลลัพธ์ + ไม่ Loading -> ไม่ต้องโชว์กล่อง)
  if (!loading && suggestions.length === 0) {
     return null; // หรือจะ return UI บอกว่าไม่เจอ ก็แล้วแต่ดีไซน์ (แต่ปกติ Search Bar ไม่พิมพ์อะไรไม่ควรขึ้น)
  }

  // ถ้าพิมพ์แล้วไม่เจอ (และหยุดโหลดแล้ว)
  if (!loading && suggestions.length === 0) {
      return (
        <div className="absolute top-full mt-2 w-full bg-[#faf9f6] rounded-xl shadow-xl border border-[#33691e]/10 z-50 overflow-hidden">
            <div className="p-4 text-sm text-[#33691e]/60 text-center font-medium">No results found.</div>
        </div>
      );
  }

  return (
    // 💡 2. "Dropdown" (กล่องลอย Theme Cream & Forest)
    <div className="absolute top-full mt-2 w-full 
                    bg-[#faf9f6] rounded-xl shadow-xl 
                    border border-[#33691e]/10 
                    max-h-60 overflow-y-auto z-50 custom-scrollbar
                  ">
      
      {loading && (
        <div className="p-4 text-sm text-[#33691e]/60 text-center font-medium flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-[#33691e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Searching...
        </div>
      )}

      {/* 3. "วนลูป" คำเดา */}
      {!loading && suggestions.length > 0 && (
        <ul>
          {suggestions.map(post => (
            <li key={post._id} className="border-b border-[#33691e]/5 last:border-b-0">
              {/* 💡 4. พอกด "คำเดา" -> "เด้ง" ไปหน้า '/search?q=...' */}
              <Link
                to={`/search?q=${post.text}`} // ⬅️ (ไปหน้า Search)
                onClick={onSelect} // ⬅️ (สั่ง "ปิด" Dropdown)
                // Style: เขียวเข้ม, Hover แล้วขยับขวา + พื้นเขียวอ่อน
                className="block p-3 text-sm text-[#33691e] hover:bg-[#33691e]/5 hover:pl-5 transition-all duration-200 truncate font-medium"
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