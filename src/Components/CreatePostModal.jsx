import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import imageCompression from 'browser-image-compression';


const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

  // ฟังก์ชันรับรูป + บีบอัด (ของจริง!)
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // เช็คไฟล์
    if (!selectedFile.type.startsWith('image/') && !selectedFile.name.match(/\.(jpg|jpeg|png|gif|heic)$/i)) {
       setError("โปรดใส่ไฟล์รูปภาพเท่านั้น");
       setFile(null);
       setPreview(null);
       return;
    }

    // ตั้งค่าบีบอัด
    const options = {
      maxSizeMB: 1,           // บีบเหลือ 1MB
      maxWidthOrHeight: 1920, // ย่อขนาด
      useWebWorker: true,
      fileType: "image/jpeg"  // แปลง HEIC เป็น JPEG
    };

    try {
      const compressedFile = await imageCompression(selectedFile, options);
      
      setFile(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      setError(null);
    } catch (err) {
      console.error("บีบอัดรูปพัง:", err);
      setError("รูปนี้มีปัญหา โปรดลองรูปอื่นๆ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !text.trim()) { 
      setError("โปรดใส่รูปกับแคปชั่นให้ครบ");
      return;
    }
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('media', file);
    formData.append('text', text.trim()); 

    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post(
        "https://back-yzvd.onrender.com/api/posts", 
        formData, 
        { headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          } }
      );

      setLoading(false);
      // ส่งข้อมูลจริงกลับไปให้ Home.jsx
      if (onPostCreated) onPostCreated(res.data); 
      if (onClose) onClose(); 

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "อัปโหลดไม่สําเร็จ");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={onClose} 
      >
        {/* Modal Container */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative bg-[#1e293b] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()} 
        >
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0f172a]/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">✨</span> Create New Post
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 flex flex-col md:flex-row gap-6">
              
              {/* ฝั่งซ้าย: Upload Area */}
              <div className="w-full md:w-1/2">
                <div className="relative group w-full aspect-square md:aspect-[4/5] bg-[#0f172a] rounded-2xl border-2 border-dashed border-gray-600 hover:border-sky-500 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                  
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      {/* ปุ่มลบรูป */}
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setFile(null); 
                          setPreview(null); 
                          setError(null); 
                        }} 
                        className="absolute top-3 right-3 bg-black/50 hover:bg-red-500 text-white rounded-full p-2 backdrop-blur-sm transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-gray-800 group-hover:bg-sky-500/20 group-hover:text-sky-400 transition-all mb-4 text-gray-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <p className="text-gray-300 font-medium group-hover:text-white transition-colors">Upload Photo</p>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 10MB</p>
                    </>
                  )}
                  
                  {/* Input ซ่อนอยู่เต็มพื้นที่ */}
                  {!preview && (
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  )}
                </div>
              </div>

              {/* ฝั่งขวา: Details */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-white/5">
                  <img src={user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/50" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-200 text-sm">{user?.username}</span>
                    <span className="text-xs text-gray-500">Posting publicly</span>
                  </div>
                </div>

                {/* Caption Input */}
                <div className="flex-1 relative">
                  <textarea 
                    className="w-full h-full min-h-[150px] bg-transparent border-none text-gray-300 placeholder-gray-500 resize-none focus:ring-0 text-lg leading-relaxed"
                    placeholder="Write a caption..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-[#0f172a]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-red-400 text-sm font-medium h-5">
                   {error && <span>⚠️ {error}</span>}
                </div>
                
                <button 
                  type="submit" 
                  className={`
                    px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all transform active:scale-95
                    ${loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 hover:shadow-sky-500/30'
                    }
                  `}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner /> <span>Posting...</span>
                    </>
                  ) : (
                    "Share Post"
                  )}
                </button>
            </div>

          </form>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}