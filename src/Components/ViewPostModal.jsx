import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import PostMenu from './Postmenu'; 
import ConfirmDeleteModal from './ConfirmDeleteModal'; 

// Helper: ดึง ID อย่างปลอดภัย
const getSafeId = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    return obj._id || obj.id || null;
};

// (Spinner Component)
const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ViewPostModal({ postId, onClose, onPostDeleted }) { 
  const { user: loggedInUser } = useUser(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State จัดการ Modal ลบ
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 

  // State จัดการ Like
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false); 

  // 🔥 State จัดการ Comment
  const [comments, setComments] = useState([]); 
  const [newComment, setNewComment] = useState(""); 
  const [commentLoading, setCommentLoading] = useState(false); 
  const commentsEndRef = useRef(null); 

  const currentUserId = getSafeId(loggedInUser);

  // (Effect 1: ดึงข้อมูลโพสต์ + คอมเมนต์)
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
        setComments(res.data.comments || []); 
        
        if (loggedInUser && res.data.likes) {
          const userLiked = res.data.likes.some(id => 
            id.toString() === currentUserId || (id._id && id._id.toString() === currentUserId)
          );
          setIsLiked(userLiked);
        }
        setLikeCount(res.data.likes ? res.data.likes.length : 0); 

      } catch (err) {
        console.error(err);
        toast.error("ไม่สามารถโหลดโพสต์ได้");
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, loggedInUser, currentUserId]); 

  // (Effect 2: Auto Scroll ลงล่างสุดเมื่อมีคอมเมนต์ใหม่)
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  // 🔥 ฟังก์ชันลบโพสต์ (ทั้งโพสต์)
  const executeDelete = async () => {
    setIsDeleting(true); 
    if (!postId) {
      toast.error("Error: Post ID is missing!");
      setIsDeleting(false);
      return;
    }

    const toastId = toast.loading('กำลังลบ...');

    try {
      const res = await axios.delete(
        `http://localhost:3000/api/posts/${postId}`, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const successMsg = res.data?.message || 'ลบเรียบร้อย!';
      toast.success(`✅ ${successMsg}`, { id: toastId });
      
      if (onPostDeleted) onPostDeleted(postId); 
      setIsConfirmOpen(false); 
      if (onClose) onClose(); 

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (err) {
      console.error("Delete Error:", err);
      const errorMsg = err.response?.data?.message || 'ลบไม่สำเร็จ';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsDeleting(false); 
    }
  };

  const handleDelete = () => {
    setIsConfirmOpen(true); 
  };

  // ฟังก์ชันกด Like
  const handleLike = async () => {
    if (likeLoading || !loggedInUser) return; 
    setLoading(true);
    setIsLiked(!isLiked); 
    setLikeCount(prevCount => prevCount + (isLiked ? -1 : 1)); 

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/posts/${postId}/like`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
      toast.error("Like System Error");
      setIsLiked(isLiked); 
      setLikeCount(likeCount);
    } finally {
      setLoading(false); 
    }
  };

  // ฟังก์ชันส่งคอมเมนต์
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return; 

    setCommentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:3000/api/posts/${postId}/comment`, 
        { text: newComment }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const addedComment = {
        ...res.data, 
        user: loggedInUser, 
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [...prev, addedComment]);
      setNewComment(""); 
      
    } catch (err) {
      console.error(err);
      toast.error("can't send comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // ฟังก์ชันลบคอมเมนต์
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("ยืนยันลบคอมเมนต์")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/posts/${postId}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prev => prev.filter(comment => {
          const cId = getSafeId(comment);
          return cId !== commentId;
      }));
      toast.success("ลบเรียบร้อย!");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "delete comment error");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="view-modal"
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
          // 🔥 Card Dark Mode Style
          className="relative bg-gray-900 shadow-2xl w-full max-w-5xl h-[90vh] mx-auto rounded-xl overflow-hidden flex flex-col md:flex-row border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ปุ่มปิด X */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-sky-500 transition-colors z-20 p-2 rounded-full bg-black/50 hover:bg-black/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {loading && ( <div className="w-full h-full flex items-center justify-center"><Spinner /></div> )}
          
          {!loading && post && (
            <>
              {/* รูปภาพ (ซ้าย) */}
              <div className="w-full md:w-3/5 h-64 md:h-full bg-black flex items-center justify-center">
                <img src={post.media} alt={post.text} className="w-full h-full object-contain" />
              </div>

              {/* ข้อมูล (ขวา) */}
              <div className="w-full md:w-2/5 h-full flex flex-col bg-gray-900">
                
                {/* Header: โปรไฟล์ + เมนู */}
                <div className="p-4 border-b border-gray-700 flex items-center gap-3 shrink-0">
                  <Link to={`/profile/${getSafeId(post.user)}`} onClick={onClose}>
                    <img src={post.user.avatar || '/img/avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/50" />
                  </Link>
                  <Link to={`/profile/${getSafeId(post.user)}`} onClick={onClose} className="font-bold text-sm text-white no-underline hover:underline">
                    {post.user.username}
                  </Link>
                  
                  {/* 🔥 ปุ่มลบโพสต์ (เช็ค ID แบบละเอียด) */}
                  {currentUserId && getSafeId(post.user) === currentUserId && (
                     <PostMenu onDelete={handleDelete} /> 
                  )}
                </div>

                {/* 🔥 Zone คอมเมนต์ (Scrollable) */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-800 custom-scrollbar">
                  
                  {/* Caption เจ้าของโพสต์ */}
                  <div className="flex items-start gap-3 pb-4 mb-2 border-b border-gray-700">
                    <Link to={`/profile/${getSafeId(post.user)}`} className="shrink-0">
                        <img src={post.user.avatar || '/img/avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                    </Link>
                    <div className="flex-1">
                      <div className="text-sm text-gray-300 leading-relaxed">
                        <span className="font-bold mr-2 text-white hover:underline">
                           <Link to={`/profile/${getSafeId(post.user)}`}>{post.user.username}</Link>
                        </span>
                        {post.text}
                      </div>
                      <span className="text-xs text-gray-500 mt-2 block">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* รายการ Comments */}
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-600 text-sm py-4">ยังไม่มีคอมเมนต์ มาเจิมหน่อยดิ๊!</p>
                  ) : (
                    comments.map((comment, index) => {
                        // Helper เช็คว่าเป็นเจ้าของเม้นไหม
                        const commentOwnerId = getSafeId(comment.user);
                        const postOwnerId = getSafeId(post.user);
                        
                        const isMyComment = currentUserId && commentOwnerId && currentUserId.toString() === commentOwnerId.toString();
                        const isMyPost = currentUserId && postOwnerId && currentUserId.toString() === postOwnerId.toString();
                        const canDelete = isMyComment || isMyPost;

                        const commentId = getSafeId(comment);
                        const displayUser = comment.user || { username: "Unknown User", avatar: null };

                        return (
                            <div key={index} className="flex items-start gap-3 group relative mb-4">
                                <Link to={`/profile/${commentOwnerId}`} className="shrink-0">
                                    <img src={displayUser.avatar || '/img/avatar.png'} alt="avatar" className={`w-8 h-8 rounded-full object-cover ${comment.user ? 'hover:opacity-90 transition-opacity' : 'grayscale opacity-50'}`} />
                                </Link>
                                <div className="flex-1 pr-6">
                                    <div className="text-sm text-gray-300 leading-snug">
                                        <Link to={`/profile/${commentOwnerId}`} className="font-bold mr-2 text-white hover:underline cursor-pointer">
                                          {displayUser.username}
                                        </Link>
                                        {comment.text}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 block">
                                      {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                                    </span>
                                    
                                    {/* 🔥 ปุ่มลบคอมเมนต์ (โชว์ตลอดเวลา) */}
                                    {canDelete && (
                                      <button 
                                        onClick={() => handleDeleteComment(commentId)}
                                        className="absolute top-0 right-0 text-gray-600 hover:text-red-500 p-1 transition-colors" 
                                        title="ลบคอมเมนต์"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                      </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {/* Footer: ปุ่ม Like + ช่องพิมพ์ */}
                <div className="p-3 border-t border-gray-700 bg-gray-900 shrink-0">
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <button onClick={handleLike} disabled={likeLoading}>
                      <svg className={`w-7 h-7 cursor-pointer transition-all hover:scale-110 active:scale-95 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400 fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.5l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
                      </svg>
                    </button>
                    <strong className="text-sm font-semibold text-white">{likeCount} likes</strong>
                  </div>

                  <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all text-white placeholder-gray-500"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={commentLoading}
                    />
                    <button 
                      type="submit" 
                      disabled={!newComment.trim() || commentLoading}
                      className="text-sky-500 font-semibold text-sm disabled:text-gray-600 hover:text-sky-400 transition-colors p-2"
                    >
                        {commentLoading ? '...' : 'Post'}
                    </button>
                  </form>
                </div>

              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {isConfirmOpen && (
        <ConfirmDeleteModal 
          key="confirm-modal" 
          onClose={() => setIsConfirmOpen(false)} 
          onConfirm={executeDelete} 
          loading={isDeleting}
        />
      )}
    </AnimatePresence>
  );
}