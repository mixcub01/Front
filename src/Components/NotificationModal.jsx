import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// 💡 Import Components ที่ต้องมี
import { useUser } from '../context/UserContext'; 

// Helper: Spinner
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Helper: แปลงเวลาให้ดูดี
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}


const getNotificationText = (noti) => {
    const sender = noti.sender?.username || 'Someone';
    const postMedia = noti.post?.media;

    switch (noti.type) {
        case 'like':
            return `${sender} ถูกใจโพสต์ของคุณ`;
        case 'comment':
            return `${sender} คอมเมนต์: "${noti.text || noti.commentText}"`; // ดึง text จาก noti.text หรือ field อื่น
        case 'follow':
            return `${sender} เริ่มติดตามคุณแล้ว`;
        default:
            return 'มีกิจกรรมใหม่';
    }
};


export default function NotificationModal({ onClose, initialUnreadCount }) { 
    const { user } = useUser();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markReadLoading, setMarkReadLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount || 0);

 
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                // ยิงไป Backend ที่เราสร้างไว้
                const res = await axios.get('https://back-yzvd.onrender.com/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setNotifications(res.data);
   
                const unread = res.data.filter(n => !n.read).length;
                setUnreadCount(unread);

            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                toast.error("ดึงรายการแจ้งเตือนไม่สำเร็จ");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);


    const handleMarkAllRead = async () => {
        if (unreadCount === 0 || markReadLoading) return;

        setMarkReadLoading(true);
        try {
            const token = localStorage.getItem('token');
            // ยิง PUT ไปบอก Backend ว่าอ่านแล้วทั้งหมด
            await axios.put('https://back-yzvd.onrender.com/api/notifications/read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // อัปเดต UI ทันที
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("ตั้งค่าว่าอ่านแล้วทั้งหมด!");
            
        } catch (err) {
            console.error("Mark as read failed:", err);
            toast.error("ตั้งค่าว่าอ่านแล้วไม่สำเร็จ");
        } finally {
            setMarkReadLoading(false);
        }
    };
    
   
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20 md:p-8"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md h-[80vh] border border-gray-800 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-white">Notifications ({unreadCount > 0 ? unreadCount : 0})</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>

                    {/* Mark All as Read Button */}
                    <div className="p-4 shrink-0">
                        <button 
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0 || markReadLoading}
                            className="w-full py-2 bg-sky-600/20 text-sky-400 rounded-lg font-semibold hover:bg-sky-600/30 transition-colors disabled:bg-gray-700 disabled:text-gray-500"
                        >
                            {markReadLoading ? 'Updating...' : `Mark All as Read (${unreadCount})`}
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading && (
                            <div className="p-4 text-center"><Spinner /></div>
                        )}
                        {notifications.length === 0 && !loading && (
                            <div className="p-4 text-center text-gray-500">No new notifications.</div>
                        )}
                        
                        {!loading && notifications.map((noti) => (
                            <Link 
                                to={`/post/${noti.post?._id}`} // 💡 ลิงก์ไปหน้าโพสต์
                                key={noti._id} 
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 p-3 border-b border-gray-800 transition-colors cursor-pointer 
                                    ${noti.read ? 'bg-gray-900/50 hover:bg-gray-800' : 'bg-sky-900/20 hover:bg-sky-900/30'}
                                `}
                            >
                                {/* Avatar SENDER */}
                                <img 
                                    src={noti.sender?.avatar || 'https://i.pravatar.cc/150?img=5'} 
                                    alt="Sender" 
                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                />

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${noti.read ? 'text-gray-400' : 'text-white font-semibold'}`}>
                                        {getNotificationText(noti)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {timeSince(new Date(noti.createdAt))}
                                    </p>
                                </div>

                                {/* Post Thumbnail */}
                                {noti.post?.media && (
                                    <img 
                                        src={noti.post.media} 
                                        alt="Post" 
                                        className="w-12 h-12 object-cover rounded-md shrink-0 border border-gray-700"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}