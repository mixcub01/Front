import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import imageCompression from 'browser-image-compression';

// Spinner สีเขียว (เพื่อให้เข้าธีม)
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-[#33691e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

  // ฟังก์ชันรับรูป + บีบอัด
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/') && !selectedFile.name.match(/\.(jpg|jpeg|png|gif|heic)$/i)) {
       setError("โปรดใส่ไฟล์รูปภาพเท่านั้น");
       setFile(null);
       setPreview(null);
       return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/jpeg"
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
          // 🔥 Backdrop: สีเขียวป่าทึบ โปร่งแสง
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a330a]/85 backdrop-blur-md p-4"
          onClick={onClose} 
      >
        {/* Modal Container */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            // 🔥 Card: พื้นขาวนวล ขอบเขียว
            className="relative bg-[#faf9f6] rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden border border-[#33691e]/10 flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()} 
        >
          
          {/* ปุ่มปิด (ลอยขวาบน) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-[#ffc857] text-[#33691e] p-2 rounded-full shadow-lg hover:bg-[#e6b44d] hover:scale-110 transition-all border-2 border-[#33691e]/10"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Header Mobile (แสดงเฉพาะจอมือถือ) */}
          <div className="md:hidden p-4 border-b border-[#33691e]/10 text-center">
             <h2 className="text-lg font-black text-[#33691e]">Create New Post</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full h-full min-h-[60vh] md:min-h-[500px]">
            
            {/* --- ฝั่งซ้าย: Upload Area (ห้องมืด) --- */}
            <div className="w-full md:w-[55%] bg-[#0f2205] p-6 md:p-8 flex flex-col justify-center items-center relative">
                <div className="relative group w-full h-full bg-[#1a330a] rounded-3xl border-2 border-dashed border-[#33691e]/30 hover:border-[#ffc857] transition-all duration-300 overflow-hidden flex flex-col items-center justify-center cursor-pointer shadow-inner">
                  
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-contain z-10" />
                      {/* Blur Background */}
                      <div className="absolute inset-0">
                         <img src={preview} alt="blur" className="w-full h-full object-cover blur-2xl opacity-40" />
                      </div>
                      
                      {/* ปุ่มลบรูป */}
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setFile(null); 
                          setPreview(null); 
                          setError(null); 
                        }} 
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all transform hover:scale-110 z-20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                      <div className="p-5 rounded-full bg-[#33691e]/20 text-[#33691e] group-hover:bg-[#ffc857] group-hover:text-[#33691e] transition-all mb-4 shadow-lg border border-[#33691e]/20">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <p className="text-[#ece4d4] font-bold text-lg group-hover:text-[#ffc857] transition-colors">Upload Photo</p>
                      <p className="text-xs text-[#ece4d4]/50 mt-2 font-medium tracking-wide">JPG, PNG up to 10MB</p>
                    </div>
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

            {/* --- ฝั่งขวา: Details (ห้องสว่าง) --- */}
            <div className="w-full md:w-[45%] flex flex-col bg-[#faf9f6]">
              
              {/* Header Desktop */}
              <div className="hidden md:flex items-center p-6 pb-0">
                 <h2 className="text-2xl font-black text-[#33691e] tracking-tight">Create Post</h2>
              </div>

              <div className="p-6 flex flex-col gap-6 flex-1">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#33691e]/5 shadow-sm">
                  <div className="p-0.5 rounded-full border border-[#ffc857]">
                    <img src={user?.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-[#33691e] text-sm">{user?.username}</span>
                    <span className="text-[10px] text-[#33691e]/50 font-bold uppercase tracking-wide">Ready to cook</span>
                  </div>
                </div>

                {/* Caption Input */}
                <div className="flex-1 relative">
                  <textarea 
                    className="w-full h-full min-h-[150px] bg-transparent border-none text-[#33691e] placeholder-[#33691e]/30 resize-none focus:ring-0 text-lg leading-relaxed font-medium"
                    placeholder="Write a caption... share your secret recipe!"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#33691e]/10 bg-white flex flex-col gap-4">
                  <div className="h-5">
                    {error && <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-md flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> {error}</span>}
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`
                      w-full py-4 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95
                      ${loading 
                        ? 'bg-[#33691e]/10 text-[#33691e]/40 cursor-not-allowed shadow-none' 
                        : 'bg-[#ffc857] text-[#33691e] hover:bg-[#e6b44d] hover:shadow-xl shadow-[#ffc857]/30'
                      }
                    `}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner /> <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        Share Post <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </>
                    )}
                  </button>
              </div>
            </div>

          </form>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}