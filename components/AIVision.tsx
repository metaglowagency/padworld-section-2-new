import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, Zap, Cpu, Scan } from 'lucide-react';

export const AIVision: React.FC = () => {
  const [analysisStep, setAnalysisStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotate analysis text
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysisStep(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Generate random logs
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `LOG_${Math.floor(Math.random() * 1000)}: ${['DETECT_MOTION', 'CALC_VELOCITY', 'PREDICT_PATH', 'OPTIMIZE_ISO'].sort(() => Math.random() - 0.5)[0]} > ${Math.random().toFixed(4)}`;
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const steps = [
    { text: "TRACKING BALL TRAJECTORY...", color: "text-neon-blue" },
    { text: "CALCULATING BOUNCE VELOCITY...", color: "text-neon-lime" },
    { text: "PLAYER MOVEMENT PREDICTION...", color: "text-white" },
    { text: "SHOT CLASSIFICATION: SMASH", color: "text-neon-lime" }
  ];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[700px] bg-black overflow-hidden border-y border-white/10 cursor-crosshair group"
    >
      {/* Simulated Video Feed Background */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1554068865-2415f90d23bb?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-screen transition-transform duration-100 group-hover:scale-105"></div>
      
      {/* SVG Overlay Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
         {/* Dynamic Grid Overlay */}
         <defs>
            <pattern id="vision-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(45,214,255,0.1)" strokeWidth="1"/>
            </pattern>
         </defs>
         <rect width="100%" height="100%" fill="url(#vision-grid)" />

         {/* Ball Path Animation */}
         <motion.path 
            d="M -100 500 Q 400 100 800 400 T 1500 200"
            fill="none"
            stroke="#ACFF01"
            strokeWidth="2"
            strokeDasharray="10 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
         />

         {/* Interactive Object Detection Box around mouse */}
         <motion.g animate={{ x: mousePos.x, y: mousePos.y }} transition={{ type: 'spring', damping: 20 }}>
            <rect x="-60" y="-60" width="120" height="120" fill="none" stroke="#2DD6FF" strokeWidth="1" />
            
            {/* Corner Brackets */}
            <path d="M -60 -40 V -60 H -40" fill="none" stroke="#2DD6FF" strokeWidth="3" />
            <path d="M 60 -40 V -60 H 40" fill="none" stroke="#2DD6FF" strokeWidth="3" />
            <path d="M -60 40 V 60 H -40" fill="none" stroke="#2DD6FF" strokeWidth="3" />
            <path d="M 60 40 V 60 H 40" fill="none" stroke="#2DD6FF" strokeWidth="3" />

            <line x1="-70" y1="0" x2="70" y2="0" stroke="#2DD6FF" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="-70" x2="0" y2="70" stroke="#2DD6FF" strokeWidth="1" opacity="0.5" />
            <text x="65" y="-65" fill="#2DD6FF" fontSize="10" fontFamily="monospace" fontWeight="bold">TARGET_LOCK</text>
         </motion.g>
      </svg>

      {/* HUD Elements */}
      <div className="absolute top-8 left-8 p-6 border-l-4 border-neon-lime bg-black/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 mb-4">
           <div className="relative">
             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse z-10 relative"></div>
             <div className="absolute inset-0 bg-red-500 blur-sm animate-pulse"></div>
           </div>
           <span className="font-mono text-sm text-red-500 font-bold tracking-widest">LIVE FEED • CAM 04</span>
        </div>
        <div className="font-mono text-3xl text-white mb-1">
          SPEED: <span className="text-neon-lime">74.2 KM/H</span>
        </div>
        <div className="font-mono text-xl text-gray-400">
          SPIN: <span className="text-neon-blue">2400 RPM</span>
        </div>
      </div>

      {/* Rolling Log Console */}
      <div className="absolute bottom-8 left-8 z-20 w-80">
        <div className="bg-black/80 border border-white/10 p-4 font-mono text-[10px] text-neon-blue h-40 overflow-hidden flex flex-col justify-end shadow-2xl">
          <div className="border-b border-white/10 mb-2 pb-1 text-gray-500">SYSTEM LOGS</div>
          {logs.map((log, i) => (
             <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - (i * 0.1), x: 0 }}>
               {log}
             </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic AI Analysis Text */}
      <div className="absolute bottom-16 left-0 right-0 text-center z-20 pointer-events-none">
        <div className="inline-block bg-black/50 backdrop-blur-sm px-8 py-4 border border-white/10 rounded-full">
            <AnimatePresence mode="wait">
            <motion.div
                key={analysisStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`font-mono text-lg font-bold tracking-[0.2em] ${steps[analysisStep].color}`}
            >
                {steps[analysisStep].text}
            </motion.div>
            </AnimatePresence>
        </div>
      </div>

      {/* Corner Data Widgets */}
      <div className="absolute top-8 right-8 flex flex-col gap-2 items-end z-20">
        <div className="bg-black/80 border border-white/10 p-3 w-40">
           <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mb-2">
              <span>CONFIDENCE</span>
              <span className="text-white">99.2%</span>
           </div>
           <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-neon-blue w-[99%] shadow-[0_0_10px_#2DD6FF]"></div>
           </div>
        </div>
        <div className="bg-black/80 border border-white/10 p-3 w-40">
           <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mb-2">
              <span>LATENCY</span>
              <span className="text-white">12ms</span>
           </div>
           <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full bg-neon-lime w-[15%] shadow-[0_0_10px_#ACFF01]"></div>
           </div>
        </div>
        
        <div className="mt-4 text-right bg-black/50 p-2 rounded backdrop-blur">
           <div className="flex items-center gap-2 justify-end mb-1">
             <Cpu className="text-white/40" size={16} />
             <span className="font-mono text-[10px] text-gray-400">COORDINATES</span>
           </div>
           <div className="font-mono text-xs text-neon-blue">
             X: {mousePos.x.toFixed(0).padStart(4, '0')} <br/> 
             Y: {mousePos.y.toFixed(0).padStart(4, '0')}
           </div>
        </div>
      </div>
    </div>
  );
};