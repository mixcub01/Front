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

// (Spinner สีเขียว)
const Spinner = () => (
  <svg className="animate-spin h-10 w-10 text-[#33691e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ViewPostModal({ postId, onClose, onPostDeleted }) { 
  const { user: loggedInUser } = useUser(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State จัดการ Modal ลบ
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 

  // State จัดการ Like
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false); 

  // State จัดการ Comment
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
          `https://back-yzvd.onrender.com/api/posts/${postId}`, 
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

  // ฟังก์ชันลบโพสต์
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
        `https://back-yzvd.onrender.com/api/posts/${postId}`, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const successMsg = res.data?.message || 'ลบเรียบร้อย!';
      toast.success(`✅ ${successMsg}`, { id: toastId });
      
      if (onPostDeleted) onPostDeleted(postId); 
      setIsConfirmOpen(false); 
      if (onClose) onClose(); 

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
    // Optimistic UI Update
    setIsLiked(!isLiked); 
    setLikeCount(prevCount => prevCount + (isLiked ? -1 : 1)); 

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://back-yzvd.onrender.com/api/posts/${postId}/like`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
      toast.error("Like System Error");
      setIsLiked(isLiked); 
      setLikeCount(likeCount);
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
        `https://back-yzvd.onrender.com/api/posts/${postId}/comment`, 
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
      toast.error("Can't send comment");
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
        `https://back-yzvd.onrender.com/api/posts/${postId}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prev => prev.filter(comment => {
          const cId = getSafeId(comment);
          return cId !== commentId;
      }));
      toast.success("ลบเรียบร้อย!");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete comment error");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="view-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // 🔥 Backdrop: สีเขียวป่าเข้มๆ โปร่งแสง + Blur
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a330a]/85 backdrop-blur-md p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          // 🔥 Modal Card: พื้นขาวนวล ตัดขอบเขียว
          className="relative bg-[#faf9f6] shadow-2xl w-full max-w-6xl h-[90vh] md:h-[85vh] mx-auto rounded-[2rem] overflow-hidden flex flex-col md:flex-row border border-[#33691e]/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ปุ่มปิด X (Floating Button) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#33691e] bg-[#ffc857] p-2.5 rounded-full shadow-lg hover:scale-110 hover:bg-[#e6b44d] transition-all z-50 border-2 border-[#33691e]/10 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {loading && ( <div className="w-full h-full flex items-center justify-center bg-[#faf9f6]"><Spinner /></div> )}
          
          {!loading && post && (
            <>
              {/* --- รูปภาพ (ซ้าย) --- */}
              {/* พื้นหลังรูปเป็นเขียวมืด เพื่อขับให้รูปเด่น */}
              <div className="w-full md:w-[60%] h-[40vh] md:h-full bg-[#0f2205] flex items-center justify-center relative overflow-hidden">
                {/* รูปหลัก */}
                <img src={post.media} alt={post.text} className="w-full h-full object-contain relative z-10 shadow-xl" />
                
                {/* Blur Background Effect */}
                <div className="absolute inset-0 overflow-hidden">
                    <img src={post.media} alt="blur-bg" className="w-full h-full object-cover blur-3xl opacity-40 scale-110" />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
              </div>

              {/* --- ข้อมูล (ขวา) --- */}
              <div className="w-full md:w-[40%] h-full flex flex-col bg-[#faf9f6] relative">
                
                {/* Header: โปรไฟล์ */}
                <div className="p-6 border-b border-[#33691e]/10 flex items-center gap-4 shrink-0 bg-white/80 backdrop-blur-xl z-20 shadow-sm">
                  <Link to={`/profile/${getSafeId(post.user)}`} onClick={onClose} className="relative group">
                    <div className="p-0.5 rounded-full border-2 border-[#ffc857] group-hover:border-[#33691e] transition-colors">
                        <img src={post.user.avatar || '/img/avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${getSafeId(post.user)}`} onClick={onClose} className="block font-black text-base text-[#33691e] no-underline hover:underline truncate">
                        {post.user.username}
                    </Link>
                    <p className="text-xs text-[#33691e]/50 font-medium tracking-wide">Original Recipe</p>
                  </div>
                  
                  {/* ปุ่มลบโพสต์ */}
                  {currentUserId && getSafeId(post.user) === currentUserId && (
                      <PostMenu onDelete={handleDelete} /> 
                  )}
                </div>

                {/* Zone คอมเมนต์ (Scrollable) */}
                <div className="flex-1 p-5 overflow-y-auto space-y-6 custom-scrollbar bg-[#faf9f6]">
                  
                  {/* Caption เจ้าของโพสต์ */}
                  <div className="flex items-start gap-3.5 pb-6 border-b border-[#33691e]/5">
                    <Link to={`/profile/${getSafeId(post.user)}`} className="shrink-0 mt-1">
                        <img src={post.user.avatar || '/img/avatar.png'} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-[#33691e]/10 shadow-sm" />
                    </Link>
                    <div className="flex-1">
                      <div className="text-sm text-[#33691e] leading-relaxed font-medium">
                        <span className="font-black mr-2 text-base block mb-1">
                            <Link to={`/profile/${getSafeId(post.user)}`}>{post.user.username}</Link>
                        </span>
                        {post.text}
                      </div>
                      <span className="text-[10px] font-bold text-[#33691e]/40 mt-3 block uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  {/* รายการ Comments */}
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[#33691e]/30 gap-3">
                        <div className="text-4xl grayscale opacity-50">💬</div>
                        <p className="text-sm font-bold">No comments yet. Be the first!</p>
                    </div>
                  ) : (
                    comments.map((comment, index) => {
                        const commentOwnerId = getSafeId(comment.user);
                        const isMyComment = currentUserId && commentOwnerId && currentUserId.toString() === commentOwnerId.toString();
                        const isMyPost = currentUserId && getSafeId(post.user) === currentUserId;
                        const canDelete = isMyComment || isMyPost;
                        const displayUser = comment.user || { username: "Unknown User", avatar: null };

                        return (
                            <div key={index} className="flex items-start gap-3 group relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <Link to={`/profile/${commentOwnerId}`} className="shrink-0 mt-1">
                                    <img src={displayUser.avatar || '/img/avatar.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-[#33691e]/10" />
                                </Link>
                                <div className="flex-1 pr-4 group-hover:pr-8 transition-all">
                                    <div className="text-sm text-[#33691e]/80 leading-snug bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-[#33691e]/5">
                                        <Link to={`/profile/${commentOwnerId}`} className="font-bold mr-2 text-[#33691e] hover:underline cursor-pointer block mb-1 text-xs uppercase tracking-wide">
                                            {displayUser.username}
                                        </Link>
                                        {comment.text}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 ml-2">
                                        <span className="text-[10px] text-[#33691e]/40 font-bold">
                                            {comment.createdAt ? timeSince(new Date(comment.createdAt)) : 'Just now'}
                                        </span>
                                    </div>
                                    
                                    {/* Delete Button (Hover) */}
                                    {canDelete && (
                                        <button 
                                            onClick={() => handleDeleteComment(getSafeId(comment))}
                                            className="absolute top-2 right-0 text-red-400 hover:text-red-600 p-1.5 rounded-full bg-white shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                                            title="Delete comment"
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

                {/* Footer: Like & Comment Input */}
                <div className="p-4 border-t border-[#33691e]/10 bg-white shrink-0 z-20 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3 mb-4 px-1">
                    <button onClick={handleLike} disabled={likeLoading} className="group flex items-center gap-2 transition-all hover:bg-rose-50 px-2 py-1 rounded-full -ml-2">
                      <div className={`p-1.5 rounded-full transition-transform group-active:scale-90 ${isLiked ? 'bg-rose-100' : ''}`}>
                          <svg className={`w-7 h-7 transition-colors ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-[#33691e] fill-none stroke-2'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.5l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
                          </svg>
                      </div>
                      <span className={`text-sm font-black ${isLiked ? 'text-rose-500' : 'text-[#33691e]'}`}>{likeCount}</span>
                    </button>
                  </div>

                  <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 relative">
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      className="flex-1 bg-[#faf9f6] border-2 border-[#33691e]/10 rounded-xl py-3.5 px-5 text-sm focus:border-[#ffc857] focus:bg-white outline-none transition-all text-[#33691e] placeholder-[#33691e]/30 font-medium shadow-inner"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={commentLoading}
                    />
                    <button 
                      type="submit" 
                      disabled={!newComment.trim() || commentLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#33691e] font-black text-xs hover:text-[#ffc857] disabled:text-[#33691e]/20 transition-colors uppercase tracking-wider"
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

// Helper function for time
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "Just now";
}