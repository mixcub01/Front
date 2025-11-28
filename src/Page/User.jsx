import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { motion, AnimatePresence } from 'framer-motion'; // ✅ เพิ่ม Animation

// Import Files ของจริง
import { useUser } from '../context/UserContext'; 
import ViewPostModal from '../Components/ViewPostModal';
import FollowListModal from '../Components/FollowListModal';


const getSafeId = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    return obj._id || obj.id || null;
};

// ----------------------------------------------------------------------
// 🔥 Profile Page Component (Version: Premium Retro)
// ----------------------------------------------------------------------
function ProfilePage({ user, setUser }) { 
  const { userId } = useParams(); 
  const { user: loggedInUser, loading: contextLoading } = useUser(); 
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null); 
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewPostId, setViewPostId] = useState(null);
  const [modalView, setModalView] = useState(null);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false); 

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (contextLoading) return;
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
  
  // --- 2. Follow Logic ---
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
          ? currentFollowers.filter(id => getSafeId(id) !== myId)
          : [...currentFollowers, myId];
        return { ...prevProfile, followers: newFollowers };
      });
      toast.success(isFollowing ? "Unfollowed!" : "Followed!");
    } catch (err) {
      toast.error("Follow error");
    } finally {
      setFollowLoading(false);
    }
  };

  // --- 3. Upload Logic ---
  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file); 
    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `https://back-yzvd.onrender.com/api/upload/${type}`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setUser(prevUser => ({ ...prevUser, [type]: res.data.url }));
      setProfile(prevProfile => ({ ...prevProfile, [type]: res.data.url }));
      toast.success(`${type} updated!`, { id: toastId });
    } catch (err) {
      toast.error(`Failed to update ${type}.`, { id: toastId });
    }
  };

  // --- 4. Delete Post Logic ---
  const deletePostFromProfile = (deletedPostId) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      posts: prevProfile.posts.filter(post => getSafeId(post) !== deletedPostId)
    }));
    setViewPostId(null);
  };


  // --- Render ---
  if (contextLoading || profileLoading) return <div className="flex justify-center pt-32"><div className="animate-spin h-10 w-10 border-4 border-[#33691e] border-t-transparent rounded-full"></div></div>;
  if (error) return <p className="text-center p-10 text-red-500 pt-32">{error}</p>;
  if (!profile) return <p className="text-center p-10 text-[#33691e]/60 pt-32">User not found.</p>; 

  const isViewingOwnProfile = loggedInUser && getSafeId(profile) === getSafeId(loggedInUser);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 text-[#33691e]">
      
      {/* 🚀 Animation: Card ค่อยๆ ลอยขึ้น */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-[#ffc857] to-[#fca503] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#33691e]/5"
      >
        
        {/* === HEADER SECTION === */}
        <div className="relative">
          {/* Banner */}
          <div 
            className="h-56 md:h-80 bg-[#e6b44d] bg-cover bg-center group relative" 
            style={{ backgroundImage: `url(${profile.banner || 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop'})` }}
          >
             {/* Gradient Overlay เพื่อให้อ่าน Text ง่ายถ้ามี */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#33691e]/40 to-transparent"></div>

             {/* Edit Banner Button */}
             {isViewingOwnProfile && (
              <label htmlFor="upload-banner" className="absolute top-4 right-4 bg-[#ece4d4]/20 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-[#ece4d4] text-[#ece4d4] hover:text-[#33691e] transition-all duration-300 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
              </label>
            )}
            <input type="file" id="upload-banner" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'banner')} />
          </div>

          {/* Avatar & Action Buttons Wrapper */}
          <div className="flex flex-col md:flex-row items-end px-8 -mt-16 md:-mt-20 relative z-10 mb-6">
            
            {/* Avatar */}
            <div className="relative group mx-auto md:mx-0">
               <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-[#ece4d4] shadow-2xl overflow-hidden bg-[#ece4d4]">
                 <img 
                    src={profile.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                 />
               </div>
               {isViewingOwnProfile && (
                <label htmlFor="upload-avatar" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </label>
               )}
               <input type="file" id="upload-avatar" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'avatar')} />
            </div>

            {/* Name & Bio */}
            <div className="flex-1 mt-4 md:mt-0 md:ml-6 text-center md:text-left md:mb-4">
                <h2 className="text-3xl md:text-4xl font-black text-[#33691e] drop-shadow-sm tracking-tight">{profile.fullName}</h2>
                <div className="text-lg font-bold text-[#33691e]/70 flex items-center justify-center md:justify-start gap-1">
                    <span>@{profile.username}</span>
                    {/* Badge เล็กๆ ถ้าอยากใส่ */}
                </div>
            </div>

            {/* Actions (Follow/Edit) */}
            <div className="mt-4 md:mb-6 flex gap-3">
                 {isViewingOwnProfile ? (
                    <button className="px-6 py-2.5 rounded-full bg-[#33691e] text-[#ece4d4] font-bold shadow-lg hover:shadow-xl hover:bg-[#2e5e1b] transition-all transform hover:-translate-y-0.5">
                        Edit Profile
                    </button>
                 ) : (
                    <button 
                        className={`px-8 py-2.5 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5
                            ${isFollowing 
                                ? 'bg-[#ece4d4] text-[#33691e] border-2 border-[#33691e]/20' 
                                : 'bg-[#33691e] text-[#ece4d4] hover:shadow-xl'
                            }
                        `}
                        onClick={handleFollow}
                        disabled={followLoading}
                    >
                        {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                 )}
            </div>
          </div>
        </div>

        {/* === STATS BAR (Glassmorphism Box) === */}
        <div className="px-6 pb-6">
            <div className="bg-[#ece4d4]/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex justify-around md:justify-start md:gap-16 border border-[#ece4d4]/50 shadow-inner">
                <div className="text-center group cursor-default">
                    <span className="block text-3xl font-black text-[#33691e]">{profile.posts ? profile.posts.length : 0}</span>
                    <span className="text-sm font-bold text-[#33691e]/60 uppercase tracking-wider">Posts</span>
                </div>
                <div className="text-center cursor-pointer group" onClick={() => setModalView('followers')}>
                    <span className="block text-3xl font-black text-[#33691e] group-hover:scale-110 transition-transform">{profile.followers ? profile.followers.length : 0}</span>
                    <span className="text-sm font-bold text-[#33691e]/60 group-hover:text-[#33691e] uppercase tracking-wider transition-colors">Followers</span>
                </div>
                <div className="text-center cursor-pointer group" onClick={() => setModalView('following')}>
                    <span className="block text-3xl font-black text-[#33691e] group-hover:scale-110 transition-transform">{profile.following ? profile.following.length : 0}</span>
                    <span className="text-sm font-bold text-[#33691e]/60 group-hover:text-[#33691e] uppercase tracking-wider transition-colors">Following</span>
                </div>
            </div>
        </div>

        {/* === POSTS GRID === */}
        <div className="bg-[#ece4d4] min-h-[300px] p-6 rounded-t-[2.5rem] mt-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-3 mb-6 pl-2">
                <div className="p-2 bg-[#ffc857] rounded-lg text-[#33691e]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <h3 className="text-xl font-black text-[#33691e]">Latest Creations</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profile.posts && profile.posts.length > 0 ? (
                    profile.posts.map((post, index) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            key={post._id}
                            className="aspect-[4/5] relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
                            onClick={() => setViewPostId(post._id)}
                        >
                            <img 
                                src={post.media} 
                                alt={post.text} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                            {/* Hover Info */}
                            <div className="absolute inset-0 bg-[#33691e]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-[#ece4d4] p-4 text-center">
                                <p className="font-bold line-clamp-2 mb-2 text-sm">{post.text}</p>
                                <div className="flex items-center gap-1 font-bold bg-[#ece4d4]/20 px-3 py-1 rounded-full backdrop-blur-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ece4d4" stroke="currentColor" strokeWidth="0"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                    <span>{post.likes ? post.likes.length : 0}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-[#33691e]/40">
                        <div className="text-6xl mb-4">🍳</div>
                        <p className="font-bold text-lg">No recipes shared yet.</p>
                    </div>
                )}
            </div>
        </div>

      </motion.div>

      {/* Modals */}
      {viewPostId && (
        <ViewPostModal 
          postId={viewPostId} 
          onClose={() => setViewPostId(null)} 
          onPostDeleted={deletePostFromProfile}
        />
      )}
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

function User() {
  const { user, loading, setUser } = useUser(); 
  if (loading) return <p className="text-center p-10 text-[#33691e]/60 pt-32">Loading profile...</p>;
  if (!user) return <p className="text-center p-10 text-[#33691e]/60 pt-32">No user data. Please login.</p>;
  return <ProfilePage user={user} setUser={setUser} />; 
}

export default User;