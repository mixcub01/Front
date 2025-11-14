import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import PostMenu from './Postmenu'; 
import ConfirmDeleteModal from './ConfirmDeleteModal'; 

// (Spinner Component)
const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ViewPostModal({ postId, onClose, onPostDeleted }) { 
  const { user: loggedInUser } = useUser(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // (State สำหรับ "ลบ")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 

  // (State สำหรับ "กดใจ")
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false); 

  // (Effect "ดึง" โพสต์)
  useEffect(() => {
    if (!postId) return; 
    const fetchPost = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:3000/api/posts/${postId}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setPost(res.data);
        
        // "เช็ค" (ตอนโหลด) ว่ามึง "Like" โพสต์นี้รึยัง
        if (loggedInUser && res.data.likes) {
          setIsLiked(res.data.likes.some(id => id.toString() === loggedInUser.id));
        }
        setLikeCount(res.data.likes ? res.data.likes.length : 0); // (นับเลข)

      } catch (err) {
        console.error(err);
        setError("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, loggedInUser]); 

  const executeDelete = async () => {
    setIsDeleting(true); 
    if (!postId) {
      toast.error("Error: Post ID is missing!");
      setIsDeleting(false);
      return;
    }

    const deletePromise = axios.delete(
      `http://localhost:3000/api/posts/${postId}`, 
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    toast.promise(
      deletePromise,
      {
        loading: 'กำลังลบ...',
        success: (res) => {
          onPostDeleted(postId); 
          setIsDeleting(false); 
          setIsConfirmOpen(false); 
          onClose(); 
          return `✅ ${res.data.message}`;
        },
        error: (err) => {
          setIsDeleting(false); 
          return err.response?.data?.message || 'ลบพังว่ะ!';
        }
      }
    );
  };

  // (Function "เปิด Modal ยืนยัน")
  const handleDelete = () => {
    setIsConfirmOpen(true); 
  };

  // (Function "กดใจ")
const handleLike = async () => {
    if (likeLoading || !loggedInUser) return; 
    setLikeLoading(true);

    // "โกง" UI
    setIsLiked(!isLiked); 
    setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1); 

    try {
      const token = localStorage.getItem('token');
      
      // 💡💡 --- นี่คือ "ตัวแก้" (สลับ Path) --- 💡💡
      await axios.put(
        `http://localhost:3000/api/posts/${postId}/like`, // ⬅️ (แก้เป็น '/:id/like')
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 💡💡 --- สิ้นสุดตัวแก้ --- 💡💡

    } catch (err) {
      console.error(err);
      toast.error("Like System Error");
    
      setIsLiked(isLiked); 
      setLikeCount(likeCount);
    } finally {
      setLikeLoading(false); 
    }
  };

  return (
    <AnimatePresence>
      {/* 1. Modal "ดูโพสต์" (Modal หลัก) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white shadow-2xl w-full max-w-5xl h-[90vh] mx-auto rounded-lg overflow-hidden flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* X Button (ปุ่มปิด) */}
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-white md:text-gray-500 hover:text-gray-900 transition-colors z-20 p-1 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* (เช็ค Loading / Error) */}
          {loading && ( <div className="w-full h-full flex items-center justify-center"><Spinner /></div> )}
          {error && ( <div className="w-full h-full flex items-center justify-center"><p className="text-red-500">{error}</p></div> )}

          {/* 5. (ถ้า "สำเร็จ") */}
          {!loading && post && (
            <>
              {/* ฝั่งซ้าย (รูป) */}
              <div className="w-full md:w-3/5 h-64 md:h-full bg-black flex items-center justify-center">
                <img 
                  src={post.media} 
                  alt={post.text}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* ฝั่งขวา (ข้อมูล) */}
              <div className="w-full md:w-2/5 h-full flex flex-col bg-white">
                
                {/* 5.1 Header (คนโพสต์) */}
                <div className="p-4 border-b border-zinc-200 flex items-center gap-3">
                  <Link to={`/profile/${post.user._id}`} onClick={onClose}>
                    <img src={post.user.avatar || '/img/avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                  </Link>
                  <Link to={`/profile/${post.user._id}`} onClick={onClose} className="font-bold text-sm text-zinc-800 no-underline hover:underline">
                    {post.user.username}
                  </Link>


<PostMenu onDelete={handleDelete} /> 
                 
                  
                </div>

                {/* 5.2 Content (Caption + Comments) */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {/* Caption (อันเดียว) */}
                  <div className="flex items-start gap-3 pb-4 border-b border-zinc-100">
                    <div>
                      <p className="text-sm text-zinc-700">
                        <strong className="mr-2 cursor-pointer hover:underline">{post.user.username}</strong>
                        {post.text}
                      </p> 
                      <span className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Comments */}
                  <h3 className="text-sm font-semibold text-zinc-600">Comments</h3>
                  <p className="text-center text-zinc-400 text-sm">(Comments WIP)</p>
                </div>

                {/* 5.3 Actions (Like/Comment) */}
                <div className="p-4 border-t border-zinc-200">
                  <div className="flex items-center gap-3">
                    
                    {/* "ปุ่ม Like" (ฉบับ "เทพ") */}
                    <button onClick={handleLike} disabled={likeLoading}>
                      <svg 
                        className={`w-7 h-7 cursor-pointer transition-all hover:scale-110 active:scale-95
                          ${isLiked ? 'text-red-500 fill-red-500' : 'text-zinc-800 fill-none'}
                        `}
                        stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.5l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
                      </svg>
                    </button>
                    
                    {/* "ปุ่ม Comment" */}
                    <svg className="w-7 h-7 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z"></path>
                    </svg>
                  </div>
                  
                  {/* "ตัวเลข Like" (อ่านจาก State) */}
                  <strong className="text-sm font-semibold mt-2 block">{likeCount} likes</strong>
                </div>

              </div>
            </>
          )}

        </motion.div>
      </motion.div>

      {isConfirmOpen && (
        <ConfirmDeleteModal 
          onClose={() => setIsConfirmOpen(false)} 
          onConfirm={executeDelete} 
          loading={isDeleting}
        />
      )}
    </AnimatePresence>
  );
}

