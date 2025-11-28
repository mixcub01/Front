import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import CreatePostModal from '../Components/CreatePostModal';
import CreatePostButton from '../Components/CreatePostButton';
import ViewPostModal from '../Components/ViewPostModal';

// --- Animation Variants (หัวใจสำคัญของความสมูท) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // การ์ดจะขึ้นมาทีละใบ
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50 }
  }
};

// --- Skeleton (ปรับให้มนขึ้นและนุ่มนวล) ---
const PostSkeleton = () => (
  <div className="mb-6 break-inside-avoid">
    <div className="bg-[#ffc857] rounded-3xl overflow-hidden shadow-sm animate-pulse border border-[#33691e]/5">
      <div className="h-64 bg-[#e6b44d]/60 w-full"></div>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-10 h-10 bg-[#33691e]/10 rounded-full"></div>
           <div className="h-3 bg-[#33691e]/10 rounded w-1/2"></div>
        </div>
        <div className="h-4 bg-[#33691e]/10 rounded w-full"></div>
        <div className="h-4 bg-[#33691e]/10 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewPostId, setViewPostId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get("https://back-yzvd.onrender.com/api/posts", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "ดึงโพสต์ไม่สำเร็จ!");
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const addPostToFeed = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const removePostFromFeed = (deletedId) => {
    setPosts(prev => prev.filter(p => p._id !== deletedId));
    setViewPostId(null);
  };

  return (
    // ✅ เพิ่ม Pattern Dot จางๆ ให้พื้นหลังดูมี Texture
    <div className="min-h-screen bg-[#ece4d4] text-[#33691e] pb-20 bg-[radial-gradient(#33691e_0.5px,transparent_0.5px)] [background-size:20px_20px]">
      
      {/* Hero Section */}
      <div className="relative w-full max-w-7xl mx-auto px-4 pt-16 pb-12 overflow-hidden">
        
        {/* Decorative Blob (แสงฟุ้งด้านหลัง) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#ffc857] rounded-full blur-[100px] opacity-40 -z-10"></div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-4"
        >
            <div className="inline-block px-4 py-1.5 rounded-full border border-[#33691e]/20 bg-[#ece4d4]/50 backdrop-blur-sm text-xs font-bold tracking-widest uppercase mb-2">
                The Community for Foodies
            </div>
            
            {/* Gradient Text สุดพรีเมียม */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-[#33691e] via-[#b4860b] to-[#33691e] drop-shadow-sm leading-tight">
                Discover <br className="md:hidden" /> Inspiration
            </h1>
            
            <p className="text-[#33691e]/70 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Explore curated menus, share your culinary masterpieces, and connect with taste explorers worldwide.
            </p>
        </motion.div>
      </div>

      {/* Main Feed */}
      <div className="w-full max-w-7xl mx-auto px-4">
        
        {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-center shadow-sm">
                🚨 {error}
            </div>
        )}

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
           {loading ? (
              [...Array(8)].map((_, i) => <PostSkeleton key={i} />)
           ) : (
              // ✅ ใช้ Stagger Animation ให้การ์ดไหลขึ้นมา
              <motion.div
                 variants={containerVariants}
                 initial="hidden"
                 animate="visible"
              >
                 <AnimatePresence>
                   {posts.map((post) => (
                      <motion.div 
                          variants={itemVariants}
                          layout
                          key={post._id}
                          className="break-inside-avoid mb-5 group"
                          onClick={() => setViewPostId(post._id)}
                      >
                          {/* ✅ Card Design: สีเหลือง มุมมนมาก (3xl) และเงาเขียวจางๆ */}
                          <div className="relative bg-[#ffc857] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(51,105,30,0.08)] transition-all duration-300 hover:shadow-[0_20px_40px_rgb(51,105,30,0.15)] hover:-translate-y-2 cursor-zoom-in border border-[#33691e]/5">
                              
                              {/* Image Section */}
                              <div className="relative overflow-hidden">
                                  <img 
                                      src={post.media} 
                                      alt={post.text} 
                                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105" 
                                      loading="lazy"
                                  />
                                  {/* Overlay: สีเขียวเข้มจางๆ พร้อมไอคอน */}
                                  <div className="absolute inset-0 bg-[#33691e]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                      <span className="bg-[#ece4d4] text-[#33691e] px-4 py-2 rounded-full font-bold text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                        View Recipe
                                      </span>
                                  </div>
                              </div>
                              
                              {/* Content Section */}
                              <div className="p-5">
                                  {/* User Header (ย้ายมาไว้ข้างบนเนื้อหา) */}
                                  <div className="flex items-center justify-between mb-3">
                                    <Link 
                                          to={`/profile/${post.user?._id}`} 
                                          className="flex items-center gap-2.5 no-underline group/user"
                                          onClick={(e) => e.stopPropagation()}
                                      >
                                          <div className="relative p-0.5 bg-[#33691e]/10 rounded-full">
                                              <img 
                                                  src={post.user?.avatar || 'https://via.placeholder.com/32'} 
                                                  alt="avatar" 
                                                  className="w-8 h-8 rounded-full object-cover" 
                                              />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs font-bold text-[#33691e] group-hover/user:underline">
                                                {post.user?.username || "Unknown"}
                                            </span>
                                          </div>
                                      </Link>
                                  </div>

                                  <p className="text-[#33691e] font-bold text-sm leading-relaxed line-clamp-2 mb-2">
                                      {post.text}
                                  </p>
                                  
                                  {/* Likes Footer */}
                                  <div className="flex items-center gap-1 text-[#33691e]/60 text-xs font-semibold">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#33691e]/40 group-hover:text-[#33691e] transition-colors"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                     <span>{post.likes ? post.likes.length : 0} likes</span>
                                  </div>
                              </div>
                          </div>
                      </motion.div>
                   ))}
                 </AnimatePresence>
              </motion.div>
           )}
        </div>

        {/* Empty State */}
        {!loading && posts.length === 0 && !error && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-[#ffc857]/10 rounded-3xl border-2 border-dashed border-[#33691e]/20"
            >
                <div className="text-7xl mb-4 opacity-80">🍳</div>
                <h3 className="text-2xl font-black text-[#33691e] mb-2">It's quiet in the kitchen...</h3>
                <p className="text-[#33691e]/60 mb-8 max-w-md text-center">Be the first chef to share your secret recipe and inspire the community!</p>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-3 bg-[#ffc857] text-[#33691e] rounded-full hover:bg-[#ffc857] hover:brightness-105 transition-all shadow-lg hover:shadow-xl font-bold text-lg hover:-translate-y-1"
                >
                    Create First Post
                </button>
            </motion.div>
        )}

      </div>

      {user && (
        <CreatePostButton onOpenModal={() => setIsCreateModalOpen(true)} /> 
      )}

      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={addPostToFeed}
        />
      )}
      
      {viewPostId && (
        <ViewPostModal 
          postId={viewPostId} 
          onClose={() => setViewPostId(null)} 
          onPostDeleted={removePostFromFeed} 
        />
      )}
    </div>
  );
}