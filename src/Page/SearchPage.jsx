import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ViewPostModal from '../Components/ViewPostModal'; 

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
// --------------------------------------------------------


export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // ดึงคำค้น
  const token = localStorage.getItem("token"); // ดึง Token
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewPostId, setViewPostId] = useState(null);

  // 💡 ดึง API (ทุกครั้งที่ 'query' เปลี่ยน)
  useEffect(() => {
    if (!query) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) {
             setError("กรุณาเข้าสู่ระบบเพื่อค้นหา");
             return;
        }

        const res = await axios.get(
          `http://localhost:3000/api/posts/search?q=${query}`, // ⬅️ ยิง API ไปที่ Backend
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setPosts(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Search failed!");
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query, token]); 

 
  const deletePostFromFeed = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative min-h-screen">
      
    
      <h2 className="text-3xl font-black text-center mb-10 text-white">
        Search results for: <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-purple-400">"{query}"</span>
      </h2>

     
      <main className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        
        {loading && (
             [...Array(6)].map((_, i) => <PostSkeleton key={i} />)
        )}
        
        {error && <p className="text-red-500 font-semibold text-center col-span-full">{error}</p>}

        {!loading && !error && posts.length > 0 ? (
            <AnimatePresence>
                {posts.map(post => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="break-inside-avoid mb-4 group"
                        key={post._id}
                        onClick={() => setViewPostId(post._id)} 
                    >
                        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 transition-all duration-300 hover:shadow-sky-900/40 hover:border-gray-700 hover:-translate-y-0.5 cursor-zoom-in">
                            <div className="relative overflow-hidden">
                                <img 
                                    src={post.media} 
                                    alt={post.text} 
                                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110" 
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

        ) : (!loading && !error && (
            // Empty State
            <p className="text-gray-500 text-xl font-semibold text-center col-span-full w-full">
              ไม่เจอโพสต์ที่ตรงกับ "{query}" เลยว่ะจารย์!
            </p>
        ))}
      </main>

 
      {viewPostId && (
        <ViewPostModal 
          postId={viewPostId} 
          onClose={() => setViewPostId(null)} 
          onPostDeleted={deletePostFromFeed} 
        />
      )}
    </div>
  );
}