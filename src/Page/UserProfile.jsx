import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import './User.css'; // 💡 1. ต้องมี CSS

export default function UserProfile() {
  const { userId } = useParams(); 
  const { user: loggedInUser, loading: contextLoading } = useUser(); 
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null); 
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  // 💡 2. เอากลับมา! (State สำหรับปุ่ม)
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false); 

  useEffect(() => {
    // (เช็ค 1: ถ้า Context "แม่" ยังโหลดไม่เสร็จ... "รอ"!)
    if (contextLoading) {
      return; 
    }
    
    // (เช็ค 2: พอ Context โหลดเสร็จ... ค่อยเช็คว่า ID ตรงกันมั้ย)
    if (loggedInUser && userId === loggedInUser.id) {
      navigate('/user'); 
      return;
    }

    // (เช็ค 3: ถ้า Context โหลดเสร็จ และ ID ไม่ตรง... ค่อย "เริ่ม" โหลดโปรไฟล์)
    const fetchUserProfile = async () => {
      setProfileLoading(true); 
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `https://backend-ai-uv1c.onrender.com/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setProfile(res.data); 

        // 💡 3. "เช็ค" ว่ามึง Follow เขาอยู่รึเปล่า (ตอนโหลด)
        if (loggedInUser && res.data.followers) {
          setIsFollowing(res.data.followers.some(followerId => followerId === loggedInUser.id));
        }
        
      } catch (err) { 
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally { 
        setProfileLoading(false); 
      }
    };

    fetchUserProfile(); 
  }, [userId, loggedInUser, contextLoading, navigate]); // 💡 (Dependency ถูกต้อง)
  
  // 💡💡 --- นี่คือ "ตัวแก้" (ฉบับ "โปร" + "กันเหนียว") --- 💡💡
  const handleFollow = async () => {
    if (followLoading || !loggedInUser) return; 
    setFollowLoading(true); // 1. เริ่ม Loading...

    try {
      const token = localStorage.getItem("token");
      await axios.put( 
        `https://backend-ai-uv1c.onrender.com/api/users/follow/${userId}`, 
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 💡 2. "โกง" UI (Success)
      setIsFollowing(!isFollowing); 
      
      // 💡 3. "อัปเดตเลข" (แบบ "กันเหนียว" ไม่ให้พัง)
      setProfile(prevProfile => {
        // ⬇️ "เช็ค" ก่อนว่า 'followers' มีจริงมั้ย? ถ้าไม่ -> ใช้ [] (Array ว่าง)
        const currentFollowers = prevProfile.followers || []; 

        if (isFollowing) {
          // (กำลังจะ Unfollow)
          return {
            ...prevProfile,
            followers: currentFollowers.filter(id => id !== loggedInUser.id) // ⬅️ ปลอดภัยแล้ว
          };
        } else {
          // (กำลังจะ Follow)
          return {
            ...prevProfile,
            followers: [...currentFollowers, loggedInUser.id] // ⬅️ ปลอดภัยแล้ว
          };
        }
      });
      
      setFollowLoading(false); // 💡 4. "ปลดล็อก" ปุ่ม (ตอน Success)

    } catch (err) {
      setFollowLoading(false); // 💡 5. "ปลดล็อก" ปุ่ม (ตอน Error)
      alert(err.response?.data?.message || "Follow พังว่ะ!");
    } 
  };



  const deletePostFromProfile = (deletedPostId) => {
    // (อัปเดต Context "แม่" ให้ฉลาด)
    setUser(prevUser => ({
      ...prevUser,
      posts: prevUser.posts.filter(post => post._id !== deletedPostId)
    }));
  };


  // 💡 --- (Render Logic) ---
  if (contextLoading) return <p className="text-center p-10">Loading User Context...</p>; 
  if (profileLoading) return <p className="text-center p-10">Loading profile...</p>; 
  if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
  if (!profile) return <p className="text-center p-10">User not found.</p>; 

  // 💡 (หน้าโปรไฟล์... ที่ "ข้อมูลครบ")
  return (
    // (กูเปลี่ยนไปใช้ Tailwind 100% นะ... มึงลบ User.css ทิ้งไปเลย)
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        
        {/* Banner + Avatar (แบบ "โปร") */}
        <div className="relative">
          <div 
            className="h-48 md:h-64 bg-zinc-200 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.banner || '/img/default_banner.jpg'})` }}
          ></div>
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <img 
              src={profile.avatar || '/img/avatar.png'} 
              alt="User Avatar" 
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-md"
            />
          </div>
        </div>

        {/* Info + ปุ่ม (ย้ายปุ่มมาไว้ข้างบน) */}
        <div className="flex justify-between items-start p-6 pt-20 md:pt-24">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-zinc-800">{profile.fullName}</h2>
            <span className="text-md text-zinc-500">@{profile.username}</span>
          </div>
          
          {/* 💡 "ปุ่ม" (ฉบับ "โปร") */}
          <div className="mt-2">
            <button 
                className={`py-2 px-6 rounded-lg font-semibold transition-all duration-200
                  ${isFollowing 
                    ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300' // ⬅️ Style "Following"
                    : 'bg-blue-500 text-white hover:bg-blue-600' // ⬅️ Style "Follow"
                  }
                  ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
            </button>
          </div>
        </div>
        
         {/* Details (ตัวเลข) */}
         <div className="flex gap-8 px-6 pb-4 border-b border-zinc-200">
            <div className="text-sm">
                <strong className="text-zinc-800">{profile.posts ? profile.posts.length : 0}</strong>
                <span className="text-zinc-500 ml-1">Posts</span>
            </div>
            <div className="text-sm">
                <strong className="text-zinc-800">{profile.followers ? profile.followers.length : 0}</strong>
                <span className="text-zinc-500 ml-1">Followers</span>
            </div>
            <div className="text-sm">
                <strong className="text-zinc-800">{profile.following ? profile.following.length : 0}</strong>
                <span className="text-zinc-500 ml-1">Following</span>
            </div>
         </div>

         {/* Post Grid (ต้องขึ้น) */}
         <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4 text-zinc-800">Posts</h3>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
                {profile.posts && profile.posts.length > 0 ? (
                    profile.posts.map(post => (
                        <div className="grid-item" key={post._id}>
    <img src={post.media} alt={post.text} className="..."/>
    
    {/* 💡💡 --- นี่คือ "ตัวแก้" --- 💡💡 */}
    <div className={`
        absolute inset-0 bg-black/40 flex justify-center items-center 
        transition-opacity duration-300
        ${/* 1. ถ้า "ไม่" Hover -> "ซ่อน" (opacity-0) และ "ไม่ขวางเมาส์" (pointer-events-none) */''}
        opacity-0 group-hover:opacity-100 pointer-events-none
    `}>
      <span className="text-white font-bold text-lg">❤️ {post.likes}</span>
    </div>
</div>
                    ))
                ) : (
                    <p className="text-zinc-500 col-span-3 text-sm">User has no posts yet.</p>
                )}
            </div>
         </div>
      </div>
    </div>
  );
}