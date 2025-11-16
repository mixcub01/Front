import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import imageCompression from 'browser-image-compression';


const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function CreatePostModal({ onClose, onPostCreated }) { 
  const { user } = useUser();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 💡 ฟังก์ชันรับรูป (ใส่ตัวบีบอัด + แปลงไฟล์)
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    
    // ถ้าไม่เลือกไฟล์ หรือยกเลิก
    if (!selectedFile) return;

    // เช็คประเภทไฟล์เบื้องต้น (กันพวกไฟล์แปลกๆ)
    if (!selectedFile.type.startsWith('image/') && !selectedFile.name.match(/\.(jpg|jpeg|png|gif|heic)$/i)) {
       setError("ต้องเป็นไฟล์รูปภาพเท่านั้น!");
       setFile(null);
       setPreview(null);
       return;
    }

    // 🔥 ตั้งค่าการบีบอัด + แปลงไฟล์
    const options = {
      maxSizeMB: 1,           // บีบให้เหลือไม่เกิน 1MB
      maxWidthOrHeight: 1920, // ย่อขนาดรูปไม่ให้ใหญ่เกินจอคอม
      useWebWorker: true,
      fileType: "image/jpeg"  // 🔥 บังคับแปลงเป็น JPEG (แก้ปัญหา iPhone ถ่ายเป็น HEIC)
    };

    try {
      // เริ่มบีบอัด!
      const compressedFile = await imageCompression(selectedFile, options);
      
      // ได้ไฟล์ใหม่มาแล้ว เอาไปเก็บไว้เตรียมส่ง
      setFile(compressedFile);
      setPreview(URL.createObjectURL(compressedFile)); // สร้างพรีวิว
      setError(null);

    } catch (err) {
      console.error("บีบอัดรูปไม่ได้", err);
      setError("รูปนี้มีปัญหา");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !text.trim()) { 
      setError(" 'รูป' และ 'ข้อความ'!");
      return;
    }
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('media', file); // ส่งไฟล์ที่บีบแล้วไป
    formData.append('text', text.trim()); 

    try {
      const token = localStorage.getItem('token');
      
      // ⚠️ ใน Preview นี้ URL อาจจะใช้งานไม่ได้จริง
      const res = await axios.post(
        "https://backend-ai-uv1c.onrender.com/api/posts", 
        formData, 
        { headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          } }
      );
      setLoading(false);
      // เรียก callback ถ้ามีส่งมา
      if (onPostCreated) onPostCreated(res.data); 
      if (onClose) onClose(); 

    } catch (err) {
      console.error(err);
      // Mock error message สำหรับ preview
      setError(err.response?.data?.message || "อัปโหลดไม่สําเร็จ (Preview Mode อาจเชื่อมต่อ Server ไม่ได้)");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose} 
    >
      <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 overflow-hidden"
          onClick={(e) => e.stopPropagation()} 
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 transition-colors z-10 p-1 rounded-full hover:bg-gray-100"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-center text-xl font-bold text-gray-800 p-4 border-b border-zinc-200">
          Create new post
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col md:flex-row gap-6 max-h-[calc(100vh-180px)] overflow-y-auto">
            {/* ฝั่งซ้าย (อัปโหลดรูป) */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 relative border-2 border-dashed border-gray-300">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="max-w-full max-h-64 object-contain rounded-md shadow-md" />
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(null); setError(null); }} 
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </>
              ) : (
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center w-full h-48 cursor-pointer text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <p className="mt-3 text-lg font-medium">Click to upload photo</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF (Auto convert HEIC)</p>
                  <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* ฝั่งขวา (ใส่ Text) */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <img src={user?.avatar || '/img/avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <span className="font-bold text-lg text-gray-800">{user?.username}</span>
              </div>
              <textarea 
                className="w-full flex-1 border border-zinc-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 placeholder-gray-400 resize-none"
                rows="10"
                placeholder="Write a captivating caption for your post..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Footer (ปุ่ม Post) */}
          <div className="p-4 border-t border-zinc-200 bg-gray-50 flex items-center justify-center">
              {error && <p className="text-red-600 text-sm font-medium mr-4">{error}</p>}
              <button 
                type="submit" 
                className="flex items-center justify-center bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                disabled={loading}
              >
            {loading && <Spinner />} 
            {loading ? "Posting..." : "Share Post"}
          </button>
        </div>
      </form>

     </motion.div>

    </motion.div>
    </AnimatePresence>
  );
}