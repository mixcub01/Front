import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Clock, 
  RefreshCcw, 
  ShieldCheck, 
  AlertTriangle, 
  TerminalSquare, 
  Wifi,
  Cpu
} from 'lucide-react';

const Dashboard = () => {
  const [status, setStatus] = useState('CHECKING');
  const [uptime, setUptime] = useState(0);
  const [latency, setLatency] = useState(0);
  const [lastChecked, setLastChecked] = useState('-');
  const [logs, setLogs] = useState([]);

  const API_URL = "https://back-yzvd.onrender.com/api/health";

  // ✅ ย้ายฟังก์ชัน addLog มาไว้ใน Component (ไม่ต้องแก้)
  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, message, type }, ...prev].slice(0, 6));
  };

  // 🔥🔥🔥 จุดที่แก้ไข: รวม Logic ไว้ใน useEffect เพื่อจัดการ Cleanup 🔥🔥🔥
  useEffect(() => {
    let isMounted = true; // 1. สร้างตัวแปรเช็คสถานะหน้าจอ
    let intervalId = null;

    const checkHealth = async () => {
      const start = Date.now();
      try {
        const res = await axios.get(API_URL);
        const end = Date.now();
        
        // 2. ก่อนอัปเดตค่า เช็คก่อนว่าหน้าจอยังอยู่ไหม
        if (isMounted) { 
          if (res.status === 200) {
            setStatus('ONLINE');
            setUptime(res.data.uptime);
            setLatency(end - start);
            
            // Update Log แบบ Functional Update (ปลอดภัย)
            const time = new Date().toLocaleTimeString();
            setLogs(prev => [{ time, message: 'Health check passed: Status OK', type: 'success' }, ...prev].slice(0, 6));
          }
        }
      } catch (error) {
        if (isMounted) {
          setStatus('OFFLINE');
          setLatency(0);
          const time = new Date().toLocaleTimeString();
          setLogs(prev => [{ time, message: `Connection failed: ${error.message}`, type: 'error' }, ...prev].slice(0, 6));
        }
      } finally {
        if (isMounted) {
          setLastChecked(new Date().toLocaleTimeString());
        }
      }
    };

    // รันครั้งแรกทันที
    checkHealth();

    // ตั้งเวลา Loop
    intervalId = setInterval(checkHealth, 5000);

    // 3. ฟังก์ชัน Cleanup (จะทำงานตอนเปลี่ยนหน้า)
    return () => {
      isMounted = false; // บอกว่าหน้าจอปิดแล้วนะ ห้ามอัปเดตอะไรอีก
      clearInterval(intervalId); // หยุด Loop
    };
  }, []); // Empty dependency array = ทำงานครั้งเดียวตอนเปิดหน้า

  // ฟังก์ชันสำหรับปุ่ม Refresh (แยกออกมาต่างหาก)
  const handleManualRefresh = async () => {
    // Logic คล้ายกัน แต่สำหรับกดปุ่มเอง
    const start = Date.now();
    try {
        setStatus('CHECKING'); // หมุนติ้วๆ
        const res = await axios.get(API_URL);
        const end = Date.now();
        if (res.status === 200) {
            setStatus('ONLINE');
            setUptime(res.data.uptime);
            setLatency(end - start);
            setLastChecked(new Date().toLocaleTimeString());
        }
    } catch (error) {
        setStatus('OFFLINE');
    }
  };

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const statusColor = status === 'ONLINE' ? 'text-emerald-600' : 'text-rose-600';
  const statusBg = status === 'ONLINE' ? 'bg-emerald-100/80' : 'bg-rose-100/80';
  const statusBorder = status === 'ONLINE' ? 'border-emerald-200' : 'border-rose-200';

  return (
    <div className="min-h-screen bg-[#f8f4e9] text-[#33691e] p-6 md:p-12 font-sans bg-[radial-gradient(#33691e_0.3px,transparent_0.3px)] [background-size:24px_24px]">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-60">
                <Cpu size={18} />
                <span className="text-xs font-bold tracking-widest uppercase">System Monitor Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#33691e]">
              Server Status
            </h1>
          </div>
          
          {/* ปุ่ม Refresh */}
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#e6b44d' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManualRefresh} // เรียกใช้ฟังก์ชันแยก
            className="group flex items-center gap-2 px-6 py-3 bg-[#ffc857] rounded-full shadow-md shadow-[#ffc857]/20 text-[#33691e] font-bold transition-all"
          >
            <RefreshCcw size={20} className={`transition-transform ${status === 'CHECKING' ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span>Refresh</span>
          </motion.button>
        </motion.div>

        {/* Main Status Area */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          
          <div className={`md:col-span-8 p-8 rounded-[2.5rem] bg-white border shadow-xl relative overflow-hidden transition-all duration-500 group
            ${status === 'ONLINE' ? 'shadow-emerald-100/50 border-emerald-100' : 'shadow-rose-100/50 border-rose-100'}
          `}>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl shadow-sm bg-[#ffc857] text-[#33691e]`}>
                  {status === 'ONLINE' ? <ShieldCheck size={40} /> : <AlertTriangle size={40} />}
                </div>
                <div>
                  <p className="text-[#33691e]/50 text-sm font-bold tracking-wider uppercase mb-1">Current Status</p>
                  <h2 className={`text-4xl md:text-5xl font-black tracking-tight ${statusColor}`}>
                    {status}
                  </h2>
                </div>
              </div>

              <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full border ${statusBg} ${statusBorder}`}>
                 <div className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'ONLINE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'ONLINE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                 </div>
                 <span className={`font-bold text-sm ${statusColor}`}>
                    {status === 'ONLINE' ? 'Operational' : 'Issues Detected'}
                 </span>
              </div>
            </div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,#33691e,#33691e_1px,transparent_1px,transparent_10px)]"></div>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            {[
                { icon: Clock, label: "Uptime", value: formatUptime(uptime), color: "text-blue-700", iconBg: "bg-blue-100" },
                { icon: Wifi, label: "Latency", value: `${latency} ms`, color: latency > 500 ? "text-rose-700" : "text-[#33691e]", iconBg: latency > 500 ? "bg-rose-100" : "bg-[#ece4d4]" }
            ].map((metric, idx) => (
                <motion.div 
                    key={idx}
                    whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
                    className="bg-white p-5 rounded-3xl border border-[#33691e]/5 shadow-sm flex flex-col justify-center h-full relative overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl ${metric.iconBg} text-[#33691e]/70`}>
                         <metric.icon size={20} />
                    </div>
                    <p className="text-[#33691e]/40 text-xs font-bold uppercase tracking-wider mb-2">{metric.label}</p>
                    <p className={`text-2xl font-black ${metric.color}`}>{metric.value}</p>
                </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center justify-center gap-3 border border-[#33691e]/5 shadow-sm text-sm">
            <Server size={16} className="text-[#ffc857]" />
            <span className="text-[#33691e]/60">Last Synchronization:</span>
            <span className="font-bold text-[#33691e]">{lastChecked}</span>
         </motion.div>

        <motion.div variants={itemVariants} className="bg-[#faf9f6] rounded-[2rem] border border-[#33691e]/10 p-1 shadow-xl overflow-hidden relative group">
            <div className="bg-white/50 backdrop-blur-md p-6 rounded-[1.8rem]">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#33691e]/5">
                    <div className="flex items-center gap-2.5 text-[#33691e]">
                        <div className="p-1.5 bg-[#ffc857] rounded-md text-[#33691e]">
                             <TerminalSquare size={18} />
                        </div>
                        <span className="font-mono font-bold text-sm tracking-wider opacity-70">LIVE_EVENT_LOGS</span>
                    </div>
                    <div className="flex gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#33691e]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#33691e]"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffc857]"></div>
                    </div>
                </div>

                <div className="space-y-2.5 font-mono text-sm max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    <AnimatePresence initial={false}>
                        {logs.map((log, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 pl-1"
                        >
                            <span className="text-[#33691e]/30 text-xs shrink-0 pt-0.5 font-bold">{log.time}</span>
                            <span className="text-[#ffc857] font-bold">{'>'}</span>
                            <div className="flex items-center gap-2 break-all">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider
                                    ${log.type === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {log.type === 'error' ? 'ERR' : 'OK'}
                                </span>
                                <span className="text-[#33691e]/80 font-medium">{log.message}</span>
                            </div>
                        </motion.div>
                        ))}
                    </AnimatePresence>
                    {logs.length === 0 && (
                        <div className="text-[#33691e]/30 italic py-6 text-center">Connecting to server stream...</div>
                    )}
                    <div className="flex items-center gap-2 mt-2 pl-1 text-[#ffc857]">
                        <span className="font-bold">{'>_'}</span>
                        <motion.span 
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "steps(2)" }}
                            className="w-2.5 h-4 bg-[#ffc857]"
                        />
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(51,105,30,0.02)_50%)] bg-[length:100%_4px]"></div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-8 flex items-center justify-center gap-2 text-[#33691e]/40 text-xs font-bold tracking-widest">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            SECURE ENCRYPTED CONNECTION
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;