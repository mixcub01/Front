import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import CreatePostModal from '../Components/CreatePostModal'; 
import { Link } from 'react-router-dom';
import CreatePostButton from '../Components/CreatePostButton'; 
import ViewPostModal from '../Components/ViewPostModal'; // 💡 1. Import "Modal ดูโพสต์"

// (โค้ด PostSkeleton... มึงมีอยู่แล้ว)
// ...

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
          setError("Please log in to view posts.");
          return;
        }
        const res = await axios.get("https://backend-ai-uv1c.onrender.com/api/posts", {
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative">
      
      <h2 className="text-2xl font-bold text-center mb-8 text-zinc-500">Feed</h2>

      <main className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4">

        {!loading && !error && posts.map(post => (
          <div 
            className="bg-white rounded-lg shadow-md overflow-hidden break-inside-avoid mb-4 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer" // ⬅️ (เพิ่ม cursor-pointer)
            key={post._id}
            onClick={() => setViewPostId(post._id)} // ⬅️ "สั่งเปิด" Modal ดูโพสต์
          >
            <img 
              src={post.media} 
              alt={post.text} 
              className="w-full h-auto object-cover" 
            />
            <div className="p-4">
              <p className="font-semibold text-sm text-zinc-800 mb-2 line-clamp-2">{post.text}</p>
              
              {/* 💡 5. "แก้" Link (ไม่ให้ Event มันทะลุ) */}
              <Link 
                to={`/profile/${post.user._id}`} 
                className="flex items-center gap-2 no-underline group"
                onClick={(e) => e.stopPropagation()} // ⬅️ "หยุด" ไม่ให้ Modal เปิด
              >
                <img 
                  src={post.user.avatar || 'https://via.placeholder.com/24'} 
                  alt="avatar" 
                  className="w-6 h-6 rounded-full" 
                />
                <span className="text-xs text-gray-600 group-hover:underline">{post.user.username}</span>
              </Link>
            </div>
          </div>
        ))}
      </main>

 

      {/* "ปุ่มบวก" (ไฟล์แยก) */}
      {user && (
        <CreatePostButton onOpenModal={() => setIsCreateModalOpen(true)} /> // 💡 6. (เปลี่ยนชื่อ State)
      )}

      {/* Modal "สร้าง" โพสต์ */}
      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={addPostToFeed}
        />
      )}
      
      {/* 💡 7. Modal "ดู" โพสต์ */}
      {viewPostId && (
        <ViewPostModal 
          postId={viewPostId} 
          onClose={() => setViewPostId(null)} 
        />
      )}
    </div>
  );
}