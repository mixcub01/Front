import React, { createContext, useContext, useState, useEffect } from "react"; // 💡 1. Import React (กันเหนียว)
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // 💡💡 2. เพิ่ม State "Loading" (นี่คือหัวใจ) 💡💡
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setLoading(false); // 💡 3. ถ้าไม่มี Token -> ก็ "เลิก" โหลด
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("https://backend-ai-uv1c.onrender.com/api/protected/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.user) setUser(res.data.user);
        else {
          setUser(null);
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error(err);
        setUser(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false); // 💡 4. ไม่ว่าจะ "พัง" หรือ "สำเร็จ" -> ก็ "เลิก" โหลด
      }
    };

    fetchUser();
  }, []);

  return (
    // 💡 5. "ปล่อย" loading State ให้ลูกๆ ใช้
    <UserContext.Provider value={{ user, setUser, loading }}> 
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);