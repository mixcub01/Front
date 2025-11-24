import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Server, 
  Clock, 
  RefreshCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal 
} from 'lucide-react';

const Dashboard = () => {
  const [status, setStatus] = useState('CHECKING'); // ONLINE, OFFLINE, CHECKING
  const [uptime, setUptime] = useState(0);
  const [latency, setLatency] = useState(0);
  const [lastChecked, setLastChecked] = useState('-');
  const [logs, setLogs] = useState([]);

  // URL ของ Backend มึง
  const API_URL = "https://back-yzvd.onrender.com/api/health";

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, message, type }, ...prev].slice(0, 5)); // เก็บแค่ 5 บรรทัดล่าสุด
  };

  const checkHealth = async () => {
    const start = Date.now();
    try {
      const res = await axios.get(API_URL);
      const end = Date.now();
      
      if (res.status === 200) {
        setStatus('ONLINE');
        setUptime(res.data.uptime);
        setLatency(end - start);
        addLog('Health check passed: Status OK', 'success');
      }
    } catch (error) {
      setStatus('OFFLINE');
      setLatency(0);
      addLog(`Connection failed: ${error.message}`, 'error');
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 3000); // เช็คทุก 3 วิ (เร็วแรงทะลุนรก)
    return () => clearInterval(interval);
  }, []);

  // แปลงวินาทีเป็น ชั่วโมง:นาที:วินาที
  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            SERVER CONNECT DASHBOARD
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time API Monitoring System</p>
        </div>
        <button 
          onClick={checkHealth}
          className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all border border-slate-700 active:scale-95"
        >
          <RefreshCcw size={20} className={status === 'CHECKING' ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Status Card */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Status Indicator */}
        <div className={`col-span-1 md:col-span-3 p-6 rounded-2xl border ${status === 'ONLINE' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'} backdrop-blur-sm relative overflow-hidden transition-all duration-500`}>
          <div className="flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {status === 'ONLINE' ? <ShieldCheck size={32} /> : <AlertTriangle size={32} />}
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">SYSTEM STATUS</p>
                <h2 className={`text-3xl font-bold tracking-wider ${status === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {status}
                </h2>
              </div>
            </div>
            {/* Pulse Animation */}
            <div className="relative flex h-6 w-6">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'ONLINE' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-6 w-6 ${status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-xs uppercase tracking-wider">Server Uptime</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{formatUptime(uptime)}</p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-xs uppercase tracking-wider">Response Latency</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{latency} ms</p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-orange-500/50 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 group-hover:text-orange-300">
              <Server size={24} />
            </div>
          </div>
          <p className="text-slate-400 text-xs uppercase tracking-wider">Last Checked</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{lastChecked}</p>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="max-w-4xl mx-auto bg-black/40 rounded-xl border border-slate-800 p-4 font-mono text-sm shadow-2xl">
        <div className="flex items-center gap-2 mb-3 text-slate-500 border-b border-slate-800 pb-2">
          <Terminal size={16} />
          <span>System Logs</span>
        </div>
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-3">
              <span className="text-slate-600">[{log.time}]</span>
              <span className={log.type === 'error' ? 'text-red-400' : 'text-emerald-400'}>
                {log.type === 'error' ? 'ERR' : 'INF'}
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && <span className="text-slate-600">Waiting for logs...</span>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;