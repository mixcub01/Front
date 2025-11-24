import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 

// 💡 NOTE: Import Files ของจริง
import { useUser } from '../context/UserContext'; 
import ViewPostModal from '../Components/ViewPostModal';
import FollowListModal from '../Components/FollowListModal';


// Helper: ฟังก์ชันแกะ ID อย่างปลอดภัย
const getSafeId = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    return obj._id || obj.id || null;
};

// ----------------------------------------------------------------------
// 🔥 Profile Page Component
// ----------------------------------------------------------------------
function ProfilePage({ user, setUser }) { 
  const { userId } = useParams(); 
  const { user: loggedInUser, loading: contextLoading } = useUser(); 
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null); 
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewPostId, setViewPostId] = useState(null);
  const [modalView, setModalView] = useState(null); // 'followers' หรือ 'following'
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false); 


  // 1. Logic ดึงข้อมูลโปรไฟล์
  useEffect(() => {
    if (contextLoading) return;
    
    // ถ้า ID ใน URL ตรงกับคนล็อกอิน ให้ดีดไปหน้า /user (Me)
    if (loggedInUser && userId === getSafeId(loggedInUser)) { 
      navigate('/user', { replace: true }); 
      return;
    }

    const fetchUserProfile = async () => {
      setProfileLoading(true); 
      try {
        const token = localStorage.getItem('token');
        
        const targetId = userId || getSafeId(loggedInUser);
        if (!targetId) return; 

        const res = await axios.get(
          `https://back-yzvd.onrender.com/api/users/${targetId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setProfile(res.data); 

        // เช็คสถานะ Follow
        if (loggedInUser && res.data.followers) {
          const myId = getSafeId(loggedInUser);
          setIsFollowing(res.data.followers.some(id => getSafeId(id) === myId));
        }
        
      } catch (err) { 
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally { 
        setProfileLoading(false); 
      }
    };

    fetchUserProfile(); 
  }, [userId, loggedInUser, contextLoading, navigate]); 
  
  
  // 2. Logic Follow / Unfollow
  const handleFollow = async () => {
    if (followLoading || !loggedInUser) return; 
    setFollowLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      await axios.put( 
        `https://back-yzvd.onrender.com/api/users/follow/${getSafeId(profile)}`, 
        {}, { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsFollowing(!isFollowing); 
      
      setProfile(prevProfile => {
        const currentFollowers = prevProfile.followers || []; 
        const myId = getSafeId(loggedInUser);
        
        const newFollowers = isFollowing
          ? currentFollowers.filter(id => getSafeId(id) !== myId) // Unfollow
          : [...currentFollowers, myId]; // Follow
        
        return { ...prevProfile, followers: newFollowers };
      });
      
      toast.success(isFollowing ? "Unfollowed!" : "Followed!");

    } catch (err) {
      toast.error(err.response?.data?.message || "Follow พังว่ะ!");
    } finally {
      setFollowLoading(false);
    }
  };

  // 3. ฟังก์ชันอัปโหลดรูป (แก้ให้ตรงกับ Backend แล้ว!)
  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // 💡 แก้ 1: ใช้ 'type' (avatar หรือ banner) เป็นชื่อ key แทน 'media' 
    // เพราะ Backend มึงเขียน upload.single("avatar") กับ upload.single("banner")
    formData.append(type, file); 

    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      const token = localStorage.getItem('token');
      const endpoint = `https://back-yzvd.onrender.com/api/upload/${type}`; 
      
      // 💡 แก้ 2: เปลี่ยนจาก put เป็น post เพราะ Backend มึงใช้ router.post()
      const res = await axios.post(
        endpoint,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      // อัปเดตข้อมูลใน Context (ให้ Header เปลี่ยนตามทันที)
      setUser(prevUser => ({
        ...prevUser,
        [type]: res.data.url, 
      }));

      // อัปเดตข้อมูลในหน้า Profile นี้ด้วย
      setProfile(prevProfile => ({
        ...prevProfile,
        [type]: res.data.url,
      }));

      toast.success(`${type} updated!`, { id: toastId });

    } catch (err) {
      console.error(err);
      toast.error(`Failed to update ${type}.`, { id: toastId });
    }
  };

  // 4. ฟังก์ชันลบโพสต์ (ส่งไปให้ Modal ใช้)
  const deletePostFromProfile = (deletedPostId) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      posts: prevProfile.posts.filter(post => getSafeId(post) !== deletedPostId)
    }));
    setViewPostId(null);
  };


  // --- Render Logic ---
  if (contextLoading || profileLoading) return <div className="flex justify-center pt-32"><div className="animate-spin h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full"></div></div>;
  if (error) return <p className="text-center p-10 text-red-500 pt-32">{error}</p>;
  if (!profile) return <p className="text-center p-10 text-gray-400 pt-32">User not found.</p>; 

  // เช็คว่าเป็นเจ้าของโปรไฟล์หรือไม่
  const isViewingOwnProfile = loggedInUser && getSafeId(profile) === getSafeId(loggedInUser);


  return (
    // 💡 3. "Card" หลัก (Dark Mode Style)
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 text-gray-100">
      <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
        
        {/* 4. Banner + Avatar (แบบ "โปร" - Overlap) */}
        <div className="relative">
          {/* Banner */}
          <div 
            className="h-48 md:h-64 bg-zinc-800 bg-cover bg-center group relative overflow-hidden" 
            style={{ backgroundImage: `url(${profile.banner || 'https://images.unsplash.com/photo-1549692520-2195f162776c?w=1200&auto=format&fit=crop'})` }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300"></div>
            
            {/* ปุ่มแก้ Banner */}
            {isViewingOwnProfile && (
              <label 
                htmlFor="upload-banner" 
                className="absolute bottom-4 right-4 bg-white/10 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
              </label>
            )}
            <input type="file" id="upload-banner" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'banner')} />
          </div>

          {/* Avatar (Overlap) */}
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-gray-900 shadow-xl group ring-4 ring-sky-500/0 hover:ring-sky-500/30 transition-all">
              <img 
                src={profile.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                alt="User Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
              {/* ปุ่มแก้ Avatar */}
              {isViewingOwnProfile && (
                <label 
                  htmlFor="upload-avatar"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                </label>
              )}
              <input type="file" id="upload-avatar" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'avatar')} />
            </div>
          </div>
        </div>
        
        {/* 5. Info + ปุ่ม "Edit/Follow" */}
        <div className="flex flex-col md:flex-row justify-between items-start p-6 pt-20 md:pt-8 md:pl-48">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white">{profile.fullName}</h2>
            <span className="text-lg text-sky-400">@{profile.username}</span>
            <p className="text-sm text-gray-400 mt-2">{profile.email}</p>
          </div>
          
          {/* 🔥 ปุ่ม Follow/Edit */}
          <div className="mt-4 md:mt-0">
            {isViewingOwnProfile ? (
              <button className="py-2 px-5 rounded-full font-bold bg-zinc-700 text-white hover:bg-zinc-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-zinc-700/30">
                Edit Profile
              </button>
            ) : (
              <button 
                className={`py-2 px-6 rounded-full font-semibold transition-all duration-200
                  ${isFollowing 
                    ? 'bg-zinc-700 text-white hover:bg-zinc-600 border border-zinc-500' // ⬅️ Style "Following"
                    : 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20' // ⬅️ Style "Follow"
                  }
                  ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
              </button>
            )}
          </div>
        </div>
        
        {/* 6. "Stats" (Posts / Followers / Following) */}
        <div className="flex gap-6 md:gap-10 px-6 md:px-8 pb-4 border-b border-gray-800">
          <div className="text-center md:text-left">
            <strong className="block text-2xl font-bold text-white">{profile.posts ? profile.posts.length : 0}</strong>
            <span className="text-sm text-gray-400">Posts</span>
          </div>
          <div className="text-center md:text-left cursor-pointer" onClick={() => setModalView('followers')}>
            <strong className="block text-2xl font-bold text-white">{profile.followers ? profile.followers.length : 0}</strong>
            <span className="text-sm text-sky-400 hover:underline">Followers</span>
          </div>
          <div className="text-center md:text-left cursor-pointer" onClick={() => setModalView('following')}>
            <strong className="block text-2xl font-bold text-white">{profile.following ? profile.following.length : 0}</strong>
            <span className="text-sm text-sky-400 hover:underline">Following</span>
          </div>
        </div>

        {/* 7. Post Grid (แบบ IG) */}
        <div className="p-4 md:p-6">
          <h3 className="text-xl font-bold mb-4 text-white">Posts by {profile.username}</h3>
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {profile.posts && profile.posts.length > 0 ? (
              profile.posts.map(post => (
                <div 
                  className="aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group relative shadow-md hover:shadow-sky-500/20 transition-all duration-300" 
                  key={post._id}
                  onClick={() => setViewPostId(post._id)} // ⬅️ "สั่งเปิด" Modal
                >
                  <img 
                    src={post.media} 
                    alt={post.text} 
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:opacity-90" 
                  />
                  {/* Overlay (Hover) */}
                  <div className="absolute inset-0 bg-black/40 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <span className="flex items-center gap-2 text-white font-bold text-lg">
                      {/* Icon หัวใจ */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg> 
                      {post.likes ? post.likes.length : 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-3 text-sm">User has no posts yet.</p>
            )}
          </div>
        </div>

      </div> 

      {/* Modal ดูโพสต์ */}
      {viewPostId && (
        <ViewPostModal 
          postId={viewPostId} 
          onClose={() => setViewPostId(null)} 
          onPostDeleted={deletePostFromProfile}
        />
      )}

      {/* Modal Followers/Following */}
      {modalView && (
        <FollowListModal 
          title={modalView === 'followers' ? 'Followers' : 'Following'} 
          users={profile[modalView]} 
          onClose={() => setModalView(null)} 
        />
      )}
      
    </div> 
  );
}


// ----------------------------------------------------------------------
// 💡 8. COMPONENT แม่ (ดึงข้อมูล) - "ฉบับ "โปร""
// ----------------------------------------------------------------------
function User() {
  const { user, loading, setUser } = useUser(); 

  // ถ้า loading หรือไม่มี user ให้โชว์ loading state
  if (loading) return <p className="text-center p-10 text-gray-400 pt-32">Loading profile...</p>;
  // ถ้าไม่มี user ให้โชว์ No user
  if (!user) return <p className="text-center p-10 text-gray-400 pt-32">No user data. Please login.</p>;

  // "ส่ง" user และ setUser (ตัวจริง) ต่อไปให้ ProfilePage!
  return <ProfilePage user={user} setUser={setUser} />; 
}

export default User;