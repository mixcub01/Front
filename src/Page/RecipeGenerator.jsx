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
        window.location.href = '/auth/login'; 
        return;
      }

      const res = await fetch("https://back-yzvd.onrender.com/api/recipe/generate", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ ingredients })
      });

      if (res.status === 401) {
        localStorage.removeItem('token'); 
        alert("หมดเวลาสนุกแล้วสิ... บัตรผ่านหมดอายุ! กรุณา Login ใหม่ครับจารย์");
        window.location.href = '/auth/login'; 
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
    // ✅ Background Cream + Dot Pattern
    <div className="min-h-screen w-full p-4 md:p-8 bg-[#ece4d4] text-[#33691e] bg-[radial-gradient(#33691e_0.5px,transparent_0.5px)] [background-size:20px_20px] flex justify-center items-start">
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border-2 border-[#33691e]/10 overflow-hidden relative"
      >
        
        {/* Header Section */}
        <div className="relative p-10 text-center overflow-hidden border-b-2 border-[#33691e]/5 bg-[#faf9f6]">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#ffc857]/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
             <span className="inline-block py-1 px-3 rounded-full bg-[#ffc857] text-[#33691e] text-xs font-bold tracking-widest uppercase mb-3 shadow-sm">
                AI Powered Kitchen
             </span>
             <h2 className="relative text-5xl md:text-6xl font-black text-[#33691e] tracking-tighter drop-shadow-sm">
                Magic <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d49925] to-[#ffc857]">Chef</span>
             </h2>
          </motion.div>
          
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative text-[#33691e]/60 mt-3 text-lg font-medium max-w-lg mx-auto"
          >
            บอกวัตถุดิบที่มี แล้วให้ AI รังสรรค์เมนูเด็ดให้คุณ
          </motion.p>
        </div>

        <div className="p-6 md:p-12 space-y-10">
          {/* Input Section */}
          <div className="relative max-w-3xl mx-auto">
            <div className="relative flex flex-col md:flex-row gap-4 shadow-lg rounded-2xl p-2 bg-[#ece4d4]/50 border border-[#33691e]/10">
                <input
                    type="text"
                    className="flex-1 px-6 py-4 text-lg rounded-xl border-2 border-transparent bg-white text-[#33691e] placeholder-[#33691e]/40 focus:outline-none focus:border-[#ffc857] focus:ring-0 transition-all font-medium"
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
                    className={`px-10 py-4 rounded-xl font-black text-lg shadow-md transition-all flex items-center justify-center gap-2
                        ${loading 
                        ? "bg-[#33691e]/10 cursor-not-allowed text-[#33691e]/40" 
                        : "bg-[#ffc857] text-[#33691e] hover:bg-[#e6b44d] hover:shadow-lg"
                        }`}
                >
                    {loading ? (
                        <>
                        <svg className="animate-spin h-5 w-5 text-[#33691e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cooking...</span>
                        </>
                    ) : (
                        <>
                        <span>Create Recipe</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
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
                className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3 shadow-sm max-w-3xl mx-auto"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                <span className="font-bold">{error}</span>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Result Section */}
          <AnimatePresence>
          {result && (
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="space-y-10"
            >
              <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-[#33691e]/10"></div>
                 <div className="text-[#33691e]/40 text-sm font-serif italic">Bon Appétit</div>
                 <div className="h-px flex-1 bg-[#33691e]/10"></div>
              </div>

              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-black text-[#33691e] mb-2 tracking-tight leading-tight">
                  {result?.menu}
                </h1>
                <div className="w-24 h-2 bg-[#ffc857] mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                
                {/* 🥦 Ingredients Card (สีเหลือง) */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-1 bg-[#ffc857] p-8 rounded-3xl shadow-xl shadow-[#ffc857]/20 relative overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 text-[#e6b44d] opacity-50">
                    <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  </div>
                  <h3 className="text-2xl font-black text-[#33691e] mb-6 flex items-center gap-3 relative z-10">
                    วัตถุดิบ
                  </h3>
                  <ul className="space-y-4 relative z-10">
                    {result?.ingredients_list?.map((i, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[#33691e] font-bold">
                        <div className="w-2 h-2 rounded-full bg-[#33691e] mt-2.5"></div>
                        <span className="text-lg">
                          {typeof i === 'object' && i !== null 
                            ? `${i.quantity || ''} ${i.unit || ''} ${i.item || ''}` 
                            : i}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* 🍳 Steps Card (สีขาวขอบเขียว) */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-white p-8 rounded-3xl border-2 border-[#33691e]/10 shadow-xl"
                >
                  <h3 className="text-2xl font-black text-[#33691e] mb-8 flex items-center gap-3 border-b-2 border-[#ece4d4] pb-4">
                    วิธีทำ
                  </h3>
                  <div className="space-y-6">
                    {result?.steps?.map((s, idx) => (
                      <div key={idx} className="flex gap-5 group">
                        <div className="flex-shrink-0 w-10 h-10 bg-[#33691e] text-[#ece4d4] rounded-full flex items-center justify-center font-black text-lg shadow-md group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        <p className="text-[#33691e]/80 leading-relaxed text-lg font-medium pt-1 group-hover:text-[#33691e] transition-colors">
                            {s}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* ⚡ Nutrition Stats (สีเขียวเข้ม) */}
              <div className="bg-[#33691e] p-8 rounded-3xl shadow-2xl relative overflow-hidden text-[#ece4d4]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
                
                <h4 className="text-xl font-bold mb-8 flex items-center gap-2 relative z-10 opacity-80">
                   <span>⚡</span> ข้อมูลโภชนาการ (ต่อจาน)
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                    {[
                        { label: "พลังงาน", value: result?.nutrition?.calories, unit: "kcal", bg: "bg-[#ffc857]", text: "text-[#33691e]" },
                        { label: "โปรตีน", value: result?.nutrition?.protein, unit: "g", bg: "bg-white/10", text: "text-white" },
                        { label: "คาร์บ", value: result?.nutrition?.carbs, unit: "g", bg: "bg-white/10", text: "text-white" },
                        { label: "ไขมัน", value: result?.nutrition?.fat, unit: "g", bg: "bg-white/10", text: "text-white" },
                    ].map((stat, index) => (
                        <div key={index} className={`${stat.bg} p-5 rounded-2xl text-center backdrop-blur-sm`}>
                            <span className={`block text-xs mb-1 opacity-80 ${stat.text}`}>{stat.label}</span>
                            <span className={`block text-3xl font-black ${stat.text}`}>{stat.value}</span>
                            <span className={`text-xs opacity-60 ${stat.text}`}>{stat.unit}</span>
                        </div>
                    ))}
                </div>
              </div>

            </motion.div>
          )}
          </AnimatePresence>
        </div>
        
        <div className="text-center pb-8 pt-4 text-[#33691e]/40 text-xs font-bold tracking-widest uppercase flex justify-center items-center gap-2">
          <span>Powered by</span> 
          <span className="text-[#33691e]">Gemini AI</span>
        </div>
      </motion.div>
    </div>
  );
}