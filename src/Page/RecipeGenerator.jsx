import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; 

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateRecipe = async () => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("ยังไม่ได้ Login");
        window.location.href = '/auth/login'; // ดีดไปหน้า Login
        return;
      }

      // 💡 ยิงไปที่ Backend
      const res = await fetch("https://back-yzvd.onrender.com/api/recipe/generate", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // แนบบัตรผ่าน
        },
        body: JSON.stringify({ ingredients })
      });

      // 🔥 ดักจับ Error 401 (Unauthorized)
      if (res.status === 401) {
        localStorage.removeItem('token'); 
        alert("หมดเวลาสนุกแล้วสิ... บัตรผ่านหมดอายุ! กรุณา Login ใหม่ครับจารย์");
        window.location.href = '/auth/login'; //กลับไปหน้า Login
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "AI not able to generate recipe");
      }

      setResult(data.data);

    } catch (err) {
      console.error("Error:", err);
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden"
      >
        
        {/* Header Section */}
        <div className="relative bg-gray-900 p-10 text-center overflow-hidden border-b border-gray-700">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            🤖 AI <span className="text-sky-500">Chef</span>
          </motion.h2>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative text-gray-400 mt-3 text-lg"
          >
            ป้อนวัตถุดิบเพื่อรับคําแนะนําในการทําอาหาร
          </motion.p>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* Input Section */}
          <div className="relative group">
            <div className="relative flex flex-col md:flex-row gap-3">
                <input
                type="text"
                className="flex-1 px-6 py-4 text-lg rounded-xl border border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-gray-600 transition-all shadow-inner"
                placeholder="เช่น ไข่ไก่, หมูสับ, น้ำปลา..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateRecipe()}
                disabled={loading}
                />
                <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateRecipe} 
                disabled={loading} 
                className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                    ${loading 
                    ? "bg-gray-600 cursor-not-allowed text-gray-400" 
                    : "bg-sky-600 hover:bg-sky-500 shadow-sky-900/20"
                    }`}
                >
                {loading ? (
                    <>
                    <svg className="animate-spin h-5 w-5 text-sky-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังประมวลผล...</span>
                    </>
                ) : (
                    <>
                    <span>สร้างเมนู</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                    </>
                )}
                </motion.button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
                <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-xl flex items-center gap-3"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                {error}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Result Section */}
          <AnimatePresence>
          {result && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="space-y-8"
            >
              <div className="h-px w-full bg-gray-700"></div>

              <div className="text-center">
                <span className="px-3 py-1 bg-sky-900/30 text-sky-400 border border-sky-800/50 rounded-full text-xs font-bold tracking-wider uppercase">Recommended Menu</span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-8">
                  {result?.menu}
                </h1>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Ingredients Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-1 bg-gray-700/50 p-6 rounded-2xl border border-gray-600 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-sky-400 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🥦</span> วัตถุดิบ
                  </h3>
                  <ul className="space-y-3">
                    {result?.ingredients_list?.map((i, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 group-hover:bg-sky-400 transition-colors"></div>
                        <span className="font-medium text-sm md:text-base">
                          {typeof i === 'object' && i !== null 
                            ? `${i.quantity || ''} ${i.unit || ''} ${i.item || ''}` 
                            : i}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Steps Card */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-gray-700/30 p-6 rounded-2xl border border-gray-600 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-sky-400 mb-6 flex items-center gap-2">
                    <span className="text-2xl">🍳</span> วิธีทำ
                  </h3>
                  <div className="space-y-8 relative pl-2">
                    <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-600"></div>

                    {result?.steps?.map((s, idx) => (
                      <div key={idx} className="relative flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg z-10 border-4 border-gray-800 text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-gray-300 leading-relaxed text-base group-hover:text-white transition-colors">
                            {s}
                            </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Nutrition Stats */}
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-200 relative z-10">
                  <span className="text-green-400">⚡</span> ข้อมูลโภชนาการ (ต่อจาน)
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    {[
                        { label: "พลังงาน", value: result?.nutrition?.calories, unit: "kcal", color: "text-yellow-400" },
                        { label: "โปรตีน", value: result?.nutrition?.protein, unit: "g", color: "text-sky-400" },
                        { label: "คาร์บ", value: result?.nutrition?.carbs, unit: "g", color: "text-green-400" },
                        { label: "ไขมัน", value: result?.nutrition?.fat, unit: "g", color: "text-pink-400" },
                    ].map((stat, index) => (
                        <div key={index} className="bg-gray-800/50 p-4 rounded-xl text-center border border-gray-700 hover:bg-gray-700/50 transition-colors">
                            <span className="block text-gray-500 text-xs mb-1">{stat.label}</span>
                            <span className={`block text-2xl font-black ${stat.color}`}>{stat.value}</span>
                            <span className="text-xs text-gray-500">{stat.unit}</span>
                        </div>
                    ))}
                </div>
              </div>

            </motion.div>
          )}
          </AnimatePresence>
        </div>
        
        <div className="text-center pb-6 pt-2 text-gray-600 text-xs flex justify-center items-center gap-1">
          <span>Powered by</span> 
          <span className="font-bold text-sky-600">Gemini AI</span>
          <span>🤖</span>
        </div>
      </motion.div>
    </div>
  );
}