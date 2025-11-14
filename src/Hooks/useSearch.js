import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useSearch(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false); 
      return;
    }

    setLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 💡💡 1. "ยิง" 2 API "พร้อมกัน" (ท่า "โปร") 💡💡
        const postPromise = axios.get(
          `https://backend-ai-uv1c.onrender.com/api/search/suggestions?q=${query}`, // ⬅️ API (1) หา Post
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const userPromise = axios.get(
          `https://backend-ai-uv1c.onrender.com/api/users/search/suggestions?q=${query}`, // ⬅️ API (2) หา User
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 💡 2. "รอ" ให้มันเสร็จทั้งคู่
        const [postResults, userResults] = await Promise.all([postPromise, userPromise]);

        // 💡 3. "แปะป้าย" (Tag) ว่าใครเป็นใคร
        const taggedPosts = postResults.data.map(p => ({ ...p, type: 'post' }));
        const taggedUsers = userResults.data.map(u => ({ ...u, type: 'user' }));

        // 💡 4. "รวมร่าง" (เอา User ขึ้นก่อน)
        setSuggestions([...taggedUsers, ...taggedPosts]); 

      } catch (err) {
        console.error(err);
        setSuggestions([]); 
      } finally {
        setLoading(false);
      }
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [query]); 

  return { suggestions, loading };
}