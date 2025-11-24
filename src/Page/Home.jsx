import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext'; 
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import Components ของจริง
import CreatePostModal from '../Components/CreatePostModal'; 
import CreatePostButton from '../Components/CreatePostButton'; 
import ViewPostModal from '../Components/ViewPostModal'; 

// Skeleton Component
const PostSkeleton = () => (
  <div className="mb-4 break-inside-avoid">
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse border border-gray-700">
      <div className="h-64 bg-gray-700/50 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700">
          <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
        </div>
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
        
        const res = await axios.get("http://localhost:3000/api/posts", {
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
    <div className="min-h-screen bg-[#0f172a] text-gray-100 pb-20"> 
      
      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-12 pb-8">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-2"
        >
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-purple-600">
                Discover Inspiration
            </h1>
            <p className="text-gray-400 text-lg font-light">
                Share your favorite menu with the world
            </p>
        </motion.div>
      </div>

      {/* Main Feed */}
      <div className="w-full max-w-7xl mx-auto px-4">
        
        {error && (
            <div className="mb-8 p-4 bg-red-900/30 border border-red-800/50 text-red-300 rounded-xl text-center">
                🚨 {error}
            </div>
        )}

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
           {loading ? (
              [...Array(10)].map((_, i) => <PostSkeleton key={i} />)
           ) : (
              <AnimatePresence>
                 {posts.map((post, index) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        key={post._id}
                        className="break-inside-avoid mb-4 group"
                        onClick={() => setViewPostId(post._id)}
                    >
                        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 transition-all duration-300 hover:shadow-sky-900/40 hover:border-gray-700 hover:-translate-y-1 cursor-zoom-in">
                            
                            {/* Image Wrapper */}
                            <div className="relative overflow-hidden">
                                <img 
                                    src={post.media} 
                                    alt={post.text} 
                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110" 
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-4">
                                <p className="text-sm text-gray-300 font-medium line-clamp-2 mb-3 leading-relaxed group-hover:text-white transition-colors">
                                    {post.text}
                                </p>
                                
                                {/* User Info Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                                  
                                    <Link 
                                        to={`/profile/${post.user?._id}`} 
                                        className="flex items-center gap-2 no-underline group/user"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="relative">
                                            <img 
                                                src={post.user?.avatar || 'https://via.placeholder.com/32'} 
                                                alt="avatar" 
                                                className="w-6 h-6 rounded-full object-cover ring-2 ring-transparent group-hover/user:ring-sky-500 transition-all" 
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 font-semibold group-hover/user:text-sky-400 transition-colors">
                                            {post.user?.username || "Unknown User"}
                                        </span>
                                    </Link>
                             

                                    <div className="text-gray-600 group-hover:text-pink-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           )}
        </div>

        {/* Empty State */}
        {!loading && posts.length === 0 && !error && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20"
            >
                <div className="text-6xl mb-4">🕸️</div>
                <h3 className="text-2xl font-bold text-gray-500">ยังไม่มีโพสต์</h3>
                <p className="text-gray-600 mb-6">คุณสามารถสร้างโพสต์แรกได้</p>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-3 bg-sky-600 text-white rounded-full hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/30 font-bold"
                >
                    สร้างโพสต์แรก
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