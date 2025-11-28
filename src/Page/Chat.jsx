import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react'; // ถ้าไม่มีให้ลบออก หรือใช้ svg แทน

function Chat() {
  return ( 
    <div className="min-h-[80vh] w-full flex flex-col justify-center items-center bg-[#ece4d4] relative overflow-hidden bg-[radial-gradient(#33691e_0.5px,transparent_0.5px)] [background-size:20px_20px]">
        
        {/* 💡 Decorative Blob: แสงฟุ้งสีเหลืองด้านหลัง */}
        <div className="absolute w-96 h-96 bg-[#ffc857]/40 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            className="relative z-10 text-center p-8"
        >
            {/* Icon (Optional) */}
            <div className="flex justify-center mb-6">
                <div className="p-5 bg-white rounded-full shadow-xl shadow-[#33691e]/10 animate-bounce">
                    <MessageCircle size={48} className="text-[#33691e]" />
                </div>
            </div>

            {/* Main Text */}
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-[#33691e] via-[#b4860b] to-[#33691e] drop-shadow-sm leading-tight pb-2">
                Coming Soon
            </h1>

            {/* Subtext */}
            <p className="text-[#33691e]/60 text-xl md:text-2xl font-medium mt-4 tracking-wide">
                We are cooking something special...
            </p>

            {/* Line Decoration */}
            <div className="w-24 h-2 bg-[#ffc857] rounded-full mx-auto mt-8"></div>
        </motion.div>

    </div> 
  );
}

export default Chat;