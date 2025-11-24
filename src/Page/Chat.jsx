import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 Firebase/Firestore Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// ----------------------------------------------------------------------
// ⚠️ ส่วนที่ต้องแก้ไขเมื่อนำไปใช้จริง (UNCOMMENT 2 บรรทัดนี้ในโปรเจกต์จารย์)
// ----------------------------------------------------------------------

// import { useUser } from "../context/UserContext"; 
// import ChatSidebar from '../Components/ChatSidebar'; 

// ----------------------------------------------------------------------
// 🛠️ ส่วนจำลอง (MOCK) เพื่อให้รันในหน้า Preview นี้ได้ (ลบทิ้งได้เลยเมื่อใช้จริง)
// ----------------------------------------------------------------------

// Mock User Context
const MOCK_USER = { _id: 'user_A', username: 'Me', avatar: 'https://i.pravatar.cc/150?u=user_A' };
const useUser = () => ({ user: MOCK_USER });

// Mock ChatSidebar
const MOCK_FRIEND_LIST = [
    { _id: 'user_B', username: 'Friend_B', avatar: 'https://i.pravatar.cc/150?u=user_B' },
    { _id: 'user_C', username: 'Friend_C', avatar: 'https://i.pravatar.cc/150?u=user_C' },
];
const ChatSidebar = ({ onSelectUser, selectedUserId }) => (
    <div className="w-full h-full bg-gray-900 border-r border-gray-700 flex flex-col rounded-l-2xl">
        <div className="p-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">DM List (Mock)</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {MOCK_FRIEND_LIST.map(user => (
                <div key={user._id} onClick={() => onSelectUser(user)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${selectedUserId === user._id ? 'bg-sky-600' : 'bg-gray-800'}`}>
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    <p className="font-semibold text-white">{user.username}</p>
                </div>
            ))}
        </div>
    </div>
);

// ----------------------------------------------------------------------

// Helper: Spinner
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


// 🔥 Helper: ดึง ID ผู้ใช้ปัจจุบัน
const getUserId = (auth, contextUser) => {
    if (auth?.currentUser?.uid) return auth.currentUser.uid;
    if (contextUser?.id) return contextUser.id;
    if (contextUser?._id) return contextUser._id;
    return null;
};

// 🔥 Helper: สร้าง Room ID สำหรับ DM (เรียง ID เสมอ)
const getDMRoomId = (userId1, userId2) => {
    if (!userId1 || !userId2) return null;
    // สำคัญ: ต้องแปลงเป็น String ก่อน Sort
    const sortedIds = [userId1.toString(), userId2.toString()].sort(); 
    return sortedIds.join('_'); // เช่น: user123_user456
};


export default function Chat() {
  const { user: contextUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [chatError, setChatError] = useState(null);
  const scrollRef = useRef(null);

  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [appId, setAppId] = useState(null);
  
  // 🔥 State สำหรับ DM
  const [selectedUser, setSelectedUser] = useState(null); 
  const [dmRoomId, setDmRoomId] = useState(null);

  // --------------------------------------------------------
  // 1. INIT FIREBASE & AUTH (เหมือนเดิม)
  // --------------------------------------------------------
  useEffect(() => {
    try {
        // 💡 ดึง Global Variables (Mocked for Preview)
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
        const authToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        if (!firebaseConfig) {
            setChatError("Firebase config not available. Cannot connect.");
            return;
        }

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const authService = getAuth(app);

        setDb(firestore);
        setAuth(authService);
        setAppId(appId);

        const signInUser = async () => {
            try {
                if (authToken) {
                    await signInWithCustomToken(authService, authToken);
                } else {
                    await signInAnonymously(authService);
                }
            } catch (authErr) {
                console.error("Firebase auth failed:", authErr);
                setChatError("Authentication failed.");
            } finally {
                setIsReady(true);
            }
        };
        signInUser();

    } catch (e) {
        console.error("Firebase initialization failed:", e);
        setChatError("Initialization failed. Check Firebase config.");
    }
  }, []);

  // --------------------------------------------------------
  // 2. LISTEN FOR DM MESSAGES (ล็อกที่นี่ที่เดียว)
  // --------------------------------------------------------
  useEffect(() => {
    const currentUserId = getUserId(auth, contextUser);
    
    // 🔥 เงื่อนไข: ถ้ายังไม่พร้อม หรือยังไม่เลือกเพื่อน -> หยุดทำงานทันที!
    if (!isReady || !db || !appId || !selectedUser || !currentUserId) {
        setMessages([]);
        setDmRoomId(null);
        return;
    }
    
    // สร้าง Room ID ที่แน่นอน (เรียง ID)
    const recipientId = getUserId(auth, selectedUser) || selectedUser._id;
    const roomId = getDMRoomId(currentUserId, recipientId);
    setDmRoomId(roomId);

    // 🔥 Path: /artifacts/{appId}/public/data/dms/{roomId}/messages
    const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/dms/${roomId}/messages`);
    
    // Query: เรียงตามเวลาล่าสุด
    const q = query(messagesCollectionRef, orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({ id: doc.id, ...data });
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Firestore listening failed:", error);
      setChatError("Failed to listen for messages.");
    });

    return unsubscribe;
  }, [isReady, db, appId, selectedUser, contextUser, auth]); // Dependencies เปลี่ยนตามการเลือก User


  // --------------------------------------------------------
  // 3. SCROLL TO BOTTOM
  // --------------------------------------------------------
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  // --------------------------------------------------------
  // 4. SEND MESSAGE
  // --------------------------------------------------------
  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();

    if (!text || !db || !dmRoomId) return;
    
    const currentUserId = getUserId(auth, contextUser);
    const username = contextUser?.username || "Guest";
    const avatar = contextUser?.avatar || "https://i.pravatar.cc/150?u=guest";

    try {
      // 🔥 Path: ยิงไปที่ Room ID ที่เฉพาะเจาะจง
      await addDoc(collection(db, `artifacts/${appId}/public/data/dms/${dmRoomId}/messages`), {
        text,
        userId: currentUserId,
        username,
        avatar,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (e) {
      console.error("Error adding document: ", e);
      setChatError("Failed to send message.");
    }
  };


  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages([]); // เคลียร์ข้อความเก่า
    setNewMessage("");
  };


  if (chatError) {
    return (
        <div className="w-full max-w-4xl mx-auto p-8 text-center bg-red-900/20 text-red-400 rounded-xl mt-6 border border-red-800">
            <p className="font-bold text-lg mb-3">💥 Chat System Error 💥</p>
            <p>{chatError}</p>
        </div>
    );
  }

  // UI ส่วนแสดงผล
  return (
    <div className="flex w-full max-w-7xl mx-auto min-h-[calc(100vh-120px)] mt-6 p-4">
      
      {/* 1. Sidebar (User List) */}
      <div className="w-1/4 min-w-[280px] h-[80vh] border-r border-gray-700">
        <ChatSidebar 
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUser?._id || selectedUser?.id} 
        />
      </div>

      {/* 2. Message Area */}
      <div className="flex-1 bg-gray-900 flex flex-col h-[80vh] rounded-r-2xl border border-gray-800 border-l-0">
        
        {/* Header DM */}
        <div className="p-4 border-b border-gray-700 shrink-0">
            {selectedUser ? (
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <img src={selectedUser.avatar || 'https://i.pravatar.cc/150?img=1'} alt="Recipient" className="w-8 h-8 rounded-full object-cover" />
                    <span>{selectedUser.username}</span>
                </h3>
            ) : (
                <h3 className="text-xl font-black text-gray-500">
                    Select a User to Start Chatting
                </h3>
            )}
        </div>
        
        {/* Message List */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 p-6 custom-scrollbar"
        >
          {!selectedUser ? (
            // 🔥 แสดงข้อความต้อนรับตอนยังไม่เลือกเพื่อน
            <div className="text-center text-gray-600 pt-20">
                <p className="text-2xl font-bold mb-3 text-sky-500">Welcome to DM Center</p>
                <p>เลือกเพื่อนจากแถบด้านซ้ายเพื่อเริ่ม DM</p>
                <p className="text-sm mt-8">⚠️ ระบบแชทต้องใช้ **Firebase Rules: Read/Write** แบบสาธารณะ</p>
            </div>
          ) : messages.length === 0 && isReady ? (
            <div className="text-center text-gray-500 py-10">
                <p>ห้องแชทว่างเปล่า... ทักทายเขาหน่อยสิ!</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => {
                const isMine = msg.userId === getUserId(auth, contextUser);
                const displayName = msg.username || 'Guest';
                const displayAvatar = msg.avatar || 'https://i.pravatar.cc/150?img=1';

                if (!msg.id) return null;

                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end max-w-xs md:max-w-md ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* Avatar */}
                      <img 
                        src={displayAvatar} 
                        alt="avatar" 
                        className={`w-8 h-8 rounded-full object-cover shrink-0 mx-2 ${isMine ? 'ml-0 mr-2' : 'mr-0 ml-2'}`}
                      />

                      {/* Message Bubble */}
                      <div 
                        className={`p-3 rounded-xl shadow-lg text-sm leading-relaxed ${
                          isMine 
                            ? 'bg-sky-600 text-white rounded-br-none' 
                            : 'bg-gray-700 text-gray-100 rounded-bl-none'
                        }`}
                      >
                        {!isMine && <p className="font-bold text-sky-400 mb-1">{displayName}</p>}
                        <p>{msg.text}</p>
                        <span className={`block text-[10px] mt-1 ${isMine ? 'text-sky-200/80' : 'text-gray-400/80'}`}>
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString() : 'Sending...'}
                        </span>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-700 shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-gray-400"
              placeholder={selectedUser ? `Message @${selectedUser.username}` : "Select a user first..."}
              disabled={!isReady || !selectedUser}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!isReady || !selectedUser || newMessage.trim() === ""}
              className="bg-sky-600 text-white px-5 py-3 rounded-full font-bold hover:bg-sky-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
            >
              Send
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}