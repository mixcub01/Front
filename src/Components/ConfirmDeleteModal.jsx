// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// // 💡 1. "รับ" Prop 3 ตัว:
// //    onConfirm (ฟังก์ชัน "ลบจริง")
// //    onClose (ฟังก์ชัน "ยกเลิก")
// //    loading (เช็คว่ากำลังลบอยู่มั้ย)
// export default function ConfirmDeleteModal({ onConfirm, onClose, loading }) {
//   return (
//     <AnimatePresence>
//       {/* 1. "Backdrop" (พื้นหลังมืด... ซ้อนอีกชั้น) */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" // 💡 (ต้อง z-index สูงกว่า Modal เก่า)
//         onClick={onClose}
//       >
//         {/* 2. "Modal Card" (กล่องยืนยัน) */}
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           transition={{ duration: 0.2 }}
//           className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm m-4 p-6"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="flex flex-col items-center text-center">
            
//             {/* 3. "Icon ตกใจ" (สีแดง) */}
//             <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
//               <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.374c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
//               </svg>
//             </div>

//             {/* 4. "Text" */}
//             <div className="mt-3">
//               <h3 className="text-lg font-semibold leading-6 text-gray-900">
//                 Delete Post?
//               </h3>
//               <div className="mt-2">
//                 <p className="text-sm text-gray-500">
//                   มึงแน่ใจนะ? ลบแล้วลบเลยนะเว้ย!
//                   กู้คืนไม่ได้นะจารย์!
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* 5. "ปุ่ม" (Delete / Cancel) */}
//           <div className="mt-6 grid grid-cols-2 gap-4">
//             <button
//               type="button"
//               className="py-2 px-4 rounded-lg font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50"
//               onClick={onClose}
//               disabled={loading} // 💡 (ปิดปุ่ม... ถ้ากำลังลบ)
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="py-2 px-4 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-200 disabled:bg-red-400"
//               onClick={onConfirm} // ⬅️ "เรียก" ฟังก์ชันลบจริง
//               disabled={loading}
//             >
//               {loading ? 'Deleting...' : 'Delete'}
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }










import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmDeleteModal({ onConfirm, onClose, loading }) {
  return (
    <AnimatePresence>
      {/* 1. "Backdrop" (พื้นหลังมืด... ซ้อนอีกชั้น) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* 2. "Modal Card" (กล่องยืนยัน) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm m-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            
            {/* 3. "Icon ตกใจ" (สีแดง) */}
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.374c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            {/* 4. "Text" */}
            <div className="mt-3">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Delete Post?
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
         ยืนยันการลบโพสต์
                </p>
              </div>
            </div>
          </div>

          {/* 5. "ปุ่ม" (Delete / Cancel) */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="py-2 px-4 rounded-lg font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50"
              onClick={onClose}
              disabled={loading} 
            >
              Cancel
            </button>
            <button
              type="button"
              className="py-2 px-4 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-200 disabled:bg-red-400"
              onClick={onConfirm} 
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}