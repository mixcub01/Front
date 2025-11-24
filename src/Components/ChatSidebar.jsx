import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// 💡 Import useUser (ของจริง)
import { useUser } from '../context/UserContext'; 

// Helper: Skeleton Loader
const UserSkeleton = () => (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
        <div className="space-y-1">
            <div className="h-4 bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
    </div>
);


// 🔥🔥🔥 Component Sidebar สำหรับ DM List 🔥🔥🔥
export default function ChatSidebar({ onSelectUser, selectedUserId }) {
    const { user: currentUser } = useUser();
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. ดึงรายการ User ทั้งหมด (เพื่อ DM)
    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser) return;
            try {
                const token = localStorage.getItem('token');
            
                const res = await axios.get('http://localhost:3000/api/users/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // กรองตัวเองออก (เช็คทั้ง .id และ ._id)
                const users = res.data.filter(u => u._id !== currentUser.id && u._id !== currentUser._id);
                setUserList(users);

            } catch (err) {
                console.error("Failed to fetch user list:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser]);

    // 2. UI
    return (
        <div className="w-full h-full bg-gray-900 border-r border-gray-700 flex flex-col rounded-l-2xl">
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">DM List</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {loading ? (
                    [1, 2, 3, 4].map(i => <UserSkeleton key={i} />)
                ) : userList.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4 text-center">No other users found.</p>
                ) : (
                    userList.map(user => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectUser(user)} // ส่ง User ที่เลือกกลับไปให้ Chat
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent 
                                ${selectedUserId === user._id 
                                    ? 'bg-sky-600 shadow-md border-sky-500' 
                                    : 'bg-gray-800 hover:bg-gray-700 hover:border-sky-700'}
                            `}
                        >
                            <img src={user.avatar || 'https://i.pravatar.cc/150?img=1'} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className={`font-semibold ${selectedUserId === user._id ? 'text-white' : 'text-gray-200'}`}>
                                    {user.username}
                                </p>
                                <p className={`text-xs ${selectedUserId === user._id ? 'text-sky-200' : 'text-gray-400'}`}>
                                    Last message...
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}