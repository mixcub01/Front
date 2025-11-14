import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import toast from 'react-hot-toast'; 
import ViewPostModal from '../Components/ViewPostModal'; // 💡 1. Import Modal ดูโพสต์
import FollowListModal from '../Components/FollowListModal';

function ProfilePage({ user, setUser }) { 
  
  const [viewPostId, setViewPostId] = useState(null); // 💡 State สำหรับ "เปิด" Modal
  const [modalView, setModalView] = useState(null);

  const handleImageChange = async (e, type) => {

    const uploadPromise = axios.post(/* ... */);
    toast.promise(uploadPromise, { /* ... */ });
  };


const deletePostFromProfile = (deletedPostId) => {
    // (อัปเดต Context "แม่" ให้ฉลาด)
    setUser(prevUser => ({
      ...prevUser,
      posts: prevUser.posts.filter(post => post._id !== deletedPostId)
    }));
  };



  return (
  	// 💡 3. "Card" หลัก (Tailwind 100%)
  	<div className="w-full max-w-5xl mx-auto p-4 md:p-8">
  	  <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
  	    
  	    {/* 4. Banner + Avatar (แบบ "โปร" - Overlap) */}
  	    <div className="relative">
  	      {/* Banner */}
  	      <div 
  	        className="h-48 md:h-64 bg-zinc-200 bg-cover bg-center group"
  	        style={{ backgroundImage: `url(${user.banner || '/img/default_banner.jpg'})` }}
  	      >
  	        {/* 💡💡 --- นี่คือ "ตัวแก้" (กูใส่โค้ดเต็มแล้ว) --- 💡💡 */}
  	        {/* ปุ่มแก้ Banner */}
  	        <label 
  	          htmlFor="upload-banner" 
  	          className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
            </label>
            <input type="file" id="upload-banner" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'banner')} />
          </div>

          {/* Avatar (Overlap) */}
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-md group">
              <img 
                src={user.avatar || '/img/avatar.png'} 
                alt="User Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
              {/* ปุ่มแก้ Avatar */}
  	          <label 
  	            htmlFor="upload-avatar"
  	            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  	          >
  	            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
  	          </label>
  	          <input type="file" id="upload-avatar" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'avatar')} />
            </div>
          </div>
        </div>
  	    {/* 💡💡 --- สิ้นสุดตัวแก้ --- 💡💡 */}


  	    {/* 5. Info + ปุ่ม "Edit" (จัด Layout ใหม่) */}
  	    <div className="flex flex-col md:flex-row justify-between items-start p-6 pt-20 md:pt-8 md:pl-48">
  	      <div className="flex-1">
  	        <h2 className="text-3xl font-bold text-zinc-800">{user.fullName}</h2>
  	        <span className="text-lg text-zinc-500">@{user.username}</span>
  	        <p className="text-sm text-zinc-600 mt-2">{user.email}</p>
  	      </div>
  	      <div className="mt-4 md:mt-0">
  	        <button className="py-2 px-5 rounded-lg font-semibold bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-all duration-200 transform hover:scale-105 active:scale-95">
  	          Edit Profile
  	        </button>
  	      </div>
  	    </div>
  	     
  	      {/* 6. "Stats" (แทน Details เก่า... โปรแกรมเมอร์) */}
  	      <div className="flex gap-6 md:gap-10 px-6 md:px-8 pb-4 border-b border-gray-200">
            <div className="text-center md:text-left">
                <strong className="block text-xl ...">{user.posts ? user.posts.length : 0}</strong>
                <span className="text-sm text-zinc-500">Posts</span>
            </div>
            {/* ⬇️ "แก้" ตรงนี้ (เพิ่ม onClick) */}
            <div className="text-center md:text-left cursor-pointer" onClick={() => setModalView('followers')}>
                <strong className="block text-xl ...">{user.followers ? user.followers.length : 0}</strong>
                <span className="text-sm text-zinc-500 hover:underline">Followers</span>
            </div>
            {/* ⬇️ "แก้" ตรงนี้ (เพิ่ม onClick) */}
            <div className="text-center md:text-left cursor-pointer" onClick={() => setModalView('following')}>
                <strong className="block text-xl ...">{user.following ? user.following.length : 0}</strong>
                <span className="text-sm text-zinc-500 hover:underline">Following</span>
            </div>
         </div>

  	      {/* 7. Post Grid (แบบ IG) */}
  	      <div className="p-4 md:p-6">
  	        <h3 className="text-xl font-semibold mb-4 text-zinc-800">My Posts</h3>
  	        <div className="grid grid-cols-3 gap-1 md:gap-4">
  	            {user.posts && user.posts.length > 0 ? (
  	                user.posts.map(post => (
  	                    <div 
                           className="aspect-square bg-zinc-100 rounded overflow-hidden cursor-pointer group relative" 
                           key={post._id}
                           onClick={() => setViewPostId(post._id)} // ⬅️ "สั่งเปิด" Modal
                         >
  	                        <img 
  	                          src={post.media} 
  	                          alt={post.text} 
  	                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:opacity-80" 
  	                        />
                            
                            {/* 💡💡 --- นี่คือ "ตัวแก้" (กูลบ Div ซ้อน) --- 💡💡 */}
  	                        {/* Overlay (Hover) */}
  	                        <div className="absolute inset-0 bg-black/40 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
  	                          <span className="flex items-center gap-2 text-white font-bold text-lg">
  	                            {/* (Icon หัวใจ "โปร") */}
  	                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                 </svg> 
                                 {post.likes ? post.likes.length : 0}
  	                          </span>
  	                        </div>
M                     </div>
  	                ))
  	            ) : (
  	                <p className="text-zinc-500 col-span-3 text-sm">ยังไม่มีโพสต์</p>
  	            )}
  	        </div>
  	      </div>

  	  </div> {/* (ปิด .profile-card) */}

  	  {/* (Render Modal ดูโพสต์) */}
  	  {viewPostId && (
  	    <ViewPostModal 
  	      postId={viewPostId} 
  	      onClose={() => setViewPostId(null)} 
          onPostDeleted={deletePostFromProfile}
  	    />
  	  )}



{modalView && (
        <FollowListModal 
          title={modalView} // ⬅️ (ส่ง "ชื่อ" Modal -> "followers")
          users={user[modalView]} // ⬅️ (ส่ง Array -> "user.followers")
          onClose={() => setModalView(null)} // ⬅️ (ส่ง "ปุ่มปิด")
        />
      )}




  	</div> // (ปิด .profile-container)
  );
}


// 💡 8. COMPONENT แม่ (ดึงข้อมูล) - "ฉบับ "โปร""
function User() {
  // 💡 "อ่าน" จาก Context (ที่โหลดมาแล้ว)
  const { user, loading, setUser } = useUser(); // 💡 4. "ดึง" setUser (ตัวจริง) มาด้วย!

  if (loading) return <p className="text-center p-10">Loading profile...</p>;
  if (!user) return <p className="text-center p-10">No user data. Please login.</p>;

  // 💡 5. "ส่ง" setUser (ตัวจริง) ต่อไปให้ลูก!
  return <ProfilePage user={user} setUser={setUser} />; 
}

export default User;