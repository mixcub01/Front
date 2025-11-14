import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // 💡 1. "Import" useSearchParams
import axios from 'axios';
import ViewPostModal from '../Components/ViewPostModal'; // 💡 (เผื่อมึงอยากให้คลิกดูได้)

// (ก๊อป Skeleton มาจาก Home.jsx)
function PostSkeleton() {
  const randomHeight = Math.floor(Math.random() * (450 - 300 + 1)) + 300; 
  return ( <div className="bg-white ...">{/* ... (โค้ด Skeleton) ... */}</div> );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams(); // 💡 2. "เตรียมอ่าน" URL
  const query = searchParams.get('q'); // 💡 3. "ดึง" คำค้น (q=...) ออกมาจาก URL

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewPostId, setViewPostId] = useState(null); // 💡 (State เปิด Modal)

  // 💡 4. "ดึง" API (ทุกครั้งที่ 'query' (คำค้น) เปลี่ยน)
  useEffect(() => {
    if (!query) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://backend-ai-uv1c.onrender.com/api/search?q=${query}`, // ⬅️ "ยิง" API ค้นหา
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(res.data);
      } catch (err) {
        console.error(err);
        setError("Search failed!");
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]); // 💡 (Dependency คือ 'query')

  // (ฟังก์ชัน "ลบ" ... ก๊อปมาจาก Home.jsx)
  const deletePostFromFeed = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative">
      
      {/* 💡 5. "หัวข้อ" (โชว์ว่าค้นหาอะไร) */}
      <h2 className="text-2xl font-bold text-center mb-8 text-zinc-700">
        Search results for: <span className="text-sky-600">"{query}"</span>
      </h2>

      {/* 💡 6. "Masonry Grid" (Layout Lemon8) */}
      <main className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-4 space-y-4">
        {loading && ( <PostSkeleton /> )}
        {error && <p className="text-red-500 font-semibold">{error}</p>}

        {!loading && !error && posts.map(post => (
          <div 
            className="bg-white rounded-lg shadow-md overflow-hidden break-inside-avoid mb-4 ... cursor-pointer" 
            key={post._id}
            onClick={() => setViewPostId(post._id)} // ⬅️ (คลิกเปิด Modal)
          >
            <img src={post.media} alt={post.text} className="w-full h-auto object-cover" />
            <div className="p-4">
              <p className="font-semibold text-sm text-zinc-800 mb-2 line-clamp-2">{post.text}</p>
              <Link 
                to={`/profile/${post.user._id}`} 
                className="flex items-center gap-2 no-underline group"
                onClick={(e) => e.stopPropagation()} 
              >
                <img src={post.user.avatar || '...'} alt="avatar" className="w-6 h-6 rounded-full" />
                <span className="text-xs text-gray-600 group-hover:underline">{post.user.username}</span>
              </Link>
            </div>
          </div>
        ))}
      </main>

      {!loading && posts.length === 0 && !error && (
        <p className="text-zinc-500 text-center col-span-full">
          ไม่เจอโพสต์ที่ตรงกับ "{query}" เลยว่ะจารย์!
        </p>
      )}

      {/* 💡 7. Modal "ดู" โพสต์ */}
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