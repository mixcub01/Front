import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// 💡 Import Context
import { useUser } from '../context/UserContext'; 

// Helper: Spinner (สีเขียว)
const Spinner = () => (
  <svg className="animate-spin h-6 w-6 text-[#33691e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Helper: เวลา
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "now";
}

// Helper: ข้อความ + ไอคอน
const getNotificationContent = (noti) => {
    const sender = noti.sender?.username || 'Someone';
    switch (noti.type) {
        case 'like':
            return { text: `liked your post`, icon: '❤️', color: 'text-rose-500' };
        case 'comment':
            return { text: `commented: "${noti.text || noti.commentText || '...'}"`, icon: '💬', color: 'text-sky-500' };
        case 'follow':
            return { text: `started following you`, icon: '👋', color: 'text-[#ffc857]' };
        default:
            return { text: 'interacted with you', icon: '🔔', color: 'text-gray-500' };
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
                const res = await axios.get('https://back-yzvd.onrender.com/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setNotifications(res.data);
                const unread = res.data.filter(n => !n.read).length;
                setUnreadCount(unread);

            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                // toast.error("โหลดแจ้งเตือนไม่สำเร็จ"); // ไม่ต้อง toast ถ้ารบกวน
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
            await axios.put('https://back-yzvd.onrender.com/api/notifications/read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("Read all!");
        } catch (err) {
            console.error(err);
        } finally {
            setMarkReadLoading(false);
        }
    };
    
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-hidden">
                
                {/* Backdrop (คลิกเพื่อปิด) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#1a330a]/20 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Drawer Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#faf9f6] shadow-[-10px_0_30px_-5px_rgba(51,105,30,0.2)] border-l border-[#33691e]/10 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    {/* Header */}
                    <div className="p-5 border-b border-[#33691e]/10 flex justify-between items-center bg-white/50 backdrop-blur-md shrink-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-[#33691e]">Notifications</h2>
                            {unreadCount > 0 && (
                                <span className="bg-[#ffc857] text-[#33691e] text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-[#33691e]/50 hover:text-[#33691e] hover:bg-[#ece4d4] p-2 rounded-full transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>

                    {/* Mark All Read Bar */}
                    <div className="px-5 py-3 bg-[#ece4d4]/30 border-b border-[#33691e]/5 shrink-0 flex justify-end">
                        <button 
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0 || markReadLoading}
                            className="text-xs font-bold text-[#33691e]/70 hover:text-[#33691e] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors uppercase tracking-wider"
                        >
                            {markReadLoading ? <Spinner /> : <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg> Mark all read</>}
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#33691e]/50">
                                <Spinner />
                                <span className="text-sm font-medium">Checking updates...</span>
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-[#33691e]/40 gap-2">
                                <div className="text-4xl">💤</div>
                                <p className="font-bold text-sm">No new activity.</p>
                            </div>
                        )}
                        
                        {!loading && notifications.map((noti) => {
                            const content = getNotificationContent(noti);
                            const isUnread = !noti.read;

                            return (
                                <Link 
                                    to={noti.post ? `/post/${noti.post._id}` : `/profile/${noti.sender?._id}`} 
                                    key={noti._id} 
                                    onClick={onClose}
                                    className={`
                                        relative flex items-start gap-3 p-4 border-b border-[#33691e]/5 transition-all
                                        ${isUnread 
                                            ? 'bg-white border-l-4 border-l-[#ffc857]' // ยังไม่อ่าน: พื้นขาว แถบเหลือง
                                            : 'bg-[#faf9f6] hover:bg-white opacity-80 hover:opacity-100' // อ่านแล้ว: พื้นครีม
                                        }
                                    `}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <img 
                                            src={noti.sender?.avatar || 'https://i.pravatar.cc/150?img=5'} 
                                            alt="Sender" 
                                            className="w-10 h-10 rounded-full object-cover border border-[#33691e]/10"
                                        />
                                        {/* Icon Overlay */}
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm text-[10px]">
                                            {content.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <p className="text-sm text-[#33691e] leading-snug">
                                            <span className="font-black hover:underline mr-1">{noti.sender?.username}</span>
                                            <span className="text-[#33691e]/80">{content.text}</span>
                                        </p>
                                        <p className="text-[10px] text-[#33691e]/40 mt-1 font-medium uppercase tracking-wide">
                                            {timeSince(new Date(noti.createdAt))}
                                        </p>
                                    </div>

                                    {/* Post Thumbnail (ถ้ามี) */}
                                    {noti.post?.media && (
                                        <div className="shrink-0">
                                            <img 
                                                src={noti.post.media} 
                                                alt="Post" 
                                                className="w-10 h-10 object-cover rounded-lg shadow-sm border border-[#33691e]/10"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Unread Dot (สำหรับ Mobile ที่อาจมอง Border ไม่ชัด) */}
                                    {isUnread && (
                                        <div className="absolute top-4 right-2 w-2 h-2 bg-[#ffc857] rounded-full md:hidden"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}