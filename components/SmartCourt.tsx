import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Layers, Video, Zap, Activity, Play, Pause, RotateCw, Cpu, Speaker, Lightbulb, Grid, Server } from 'lucide-react';

interface SmartCourtProps {
  demoMode?: boolean;
}

export const SmartCourt: React.FC<SmartCourtProps> = ({ demoMode = false }) => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  
  // Refs for auto-rotation
  const requestRef = useRef<number>(0);

  // Handle Demo Mode Trigger
  useEffect(() => {
    if (demoMode) {
        setIsAutoMode(false);
        // Sequence: Rotate to nice angle -> Explode -> Wait -> Collapse
        const seq = async () => {
            setRotation(45); // Set optimal viewing angle
            await new Promise(r => setTimeout(r, 1000));
            setExploded(true);
            await new Promise(r => setTimeout(r, 6000));
            setExploded(false);
        };
        seq();
    }
  }, [demoMode]);
  
  // Auto-rotation loop
  useEffect(() => {
    if (!isAutoMode) return;
    
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = time - lastTime;
      // Rotate 360 degrees over ~30 seconds for a smooth cinematic pan
      setRotation(prev => (prev + (delta * 0.01)) % 360);
      lastTime = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isAutoMode]);

  // Auto-explode sequence (only if auto mode is ON and NOT demo mode)
  useEffect(() => {
    if (!isAutoMode || demoMode) return;
    const interval = setInterval(() => {
        setExploded(prev => !prev);
    }, 8000); // Toggle every 8 seconds
    return () => clearInterval(interval);
  }, [isAutoMode, demoMode]);

  const toggleAutoMode = () => {
      setIsAutoMode(!isAutoMode);
  };

  // Reusable Label Component for Exploded View
  const LayerLabel = ({ text, icon: Icon, align = 'left' }: { text: string, icon: any, align?: 'left' | 'right' }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: exploded ? 1 : 0 }}
      transition={{ duration: 0.5, delay: exploded ? 0.5 : 0 }}
      className={`absolute ${align === 'left' ? '-left-32 md:-left-48' : '-right-32 md:-right-48'} top-1/2 -translate-y-1/2 flex items-center gap-3 w-32 md:w-40 pointer-events-none z-50`}
    >
        {align === 'left' && (
            <div className="flex-1 text-right">
                <div className="text-neon-lime font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-tight">{text}</div>
            </div>
        )}
        <div className="w-6 h-6 md:w-8 md:h-8 bg-black/80 border border-neon-lime/50 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(172,255,1,0.3)] flex-shrink-0">
            <Icon size={12} className="text-white" />
        </div>
        {align === 'right' && (
            <div className="flex-1 text-left">
                <div className="text-neon-lime font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-tight">{text}</div>
            </div>
        )}
        {/* Connector Line */}
        <div className={`absolute top-1/2 ${align === 'left' ? 'left-full' : 'right-full'} w-4 md:w-8 h-[1px] bg-neon-lime/50`}></div>
    </motion.div>
  );

  return (
    <div className="relative w-full h-[900px] flex items-center justify-center perspective-container overflow-hidden bg-holographic-grid bg-[length:40px_40px]">
      
      {/* Header Controls (Visual Only) */}
      <div className="absolute top-8 left-8 z-30 space-y-4 pointer-events-none">
        <div className="flex items-center gap-2 mb-2 pointer-events-auto">
           <div className={`w-2 h-2 rounded-full ${isAutoMode ? 'bg-neon-lime animate-pulse' : 'bg-gray-500'}`}></div>
           <span className="font-mono text-xs text-neon-lime tracking-widest">
             {isAutoMode ? 'AUTO-SEQUENCE ACTIVE' : demoMode ? 'DEMO MODE ACTIVE' : 'MANUAL CONTROL'}
           </span>
        </div>
        <h2 className="font-sans font-black text-3xl uppercase tracking-tighter text-white leading-none">
          Smart Court <span className="text-neon-lime">V2.0</span>
        </h2>
      </div>

      {/* Floating Control Bar - MOVED DOWN */}
      <div className="absolute bottom-6 z-30 flex items-center gap-4 bg-black/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl scale-90 md:scale-100">
         <button 
           onClick={toggleAutoMode}
           className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-neon-lime hover:text-black text-white transition-all border border-white/10"
         >
            {isAutoMode ? <Pause size={16} /> : <Play size={16} />}
         </button>
         
         <div className="h-8 w-[1px] bg-white/10"></div>

         <button 
            onClick={() => { setIsAutoMode(false); setExploded(!exploded); }}
            className={`px-4 py-2 border rounded-full font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${exploded ? 'bg-neon-lime text-black border-neon-lime' : 'border-white/20 text-white hover:bg-white/10'}`}
          >
            <Layers size={14} /> {exploded ? 'COLLAPSE VIEW' : 'EXPLODED VIEW'}
         </button>

         <div className="flex items-center gap-2 ml-2">
            <RotateCw size={14} className="text-gray-500" />
            <input 
                type="range" 
                min="0" 
                max="360" 
                value={rotation} 
                onChange={(e) => { setIsAutoMode(false); setRotation(Number(e.target.value)); }}
                className="w-32 accent-neon-lime cursor-pointer bg-gray-800 h-1 rounded-full appearance-none"
            />
         </div>
      </div>

      {/* 3D Scene Wrapper */}
      {/* ADDED MARGIN TOP TO PREVENT HEADER OVERLAP IN EXPLODED VIEW */}
      <motion.div 
        className="relative w-[280px] h-[190px] md:w-[500px] md:h-[340px] mt-24 md:mt-32"
        style={{ 
          transformStyle: 'preserve-3d',
          rotateX: 60, 
          rotateZ: rotation
        }}
      >
        {/* --- LAYER 8: LIGHTING RAILS (Topmost) --- */}
        <motion.div 
          className="absolute inset-0 border border-white/50"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ translateZ: exploded ? 400 : 120, opacity: exploded ? 1 : 0.1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             <div className="absolute inset-0 grid grid-cols-4 gap-4">
                 {[...Array(4)].map((_, i) => (
                     <div key={i} className="h-full border-r border-white/30 flex items-center justify-center">
                         <div className="w-1 h-full bg-white/20 blur-[1px]"></div>
                     </div>
                 ))}
             </div>
             {/* Floodlights */}
             <div className="absolute top-0 left-0 w-4 h-4 bg-white shadow-[0_0_20px_white]"></div>
             <div className="absolute top-0 right-0 w-4 h-4 bg-white shadow-[0_0_20px_white]"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 bg-white shadow-[0_0_20px_white]"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 bg-white shadow-[0_0_20px_white]"></div>
             
             <LayerLabel text="Lighting Rails" icon={Lightbulb} align="left" />
        </motion.div>

        {/* --- LAYER 7: AUDIO FEEDBACK SYSTEM --- */}
        <motion.div 
          className="absolute inset-10 border border-neon-blue/30 rounded-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ translateZ: exploded ? 320 : 100, opacity: exploded ? 1 : 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             {/* Speakers */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-neon-blue/20 border border-neon-blue"></div>
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-neon-blue/20 border border-neon-blue"></div>
             {/* Sound Waves Visualization */}
             <div className="absolute inset-0 border border-dashed border-neon-blue/20 rounded-full animate-pulse"></div>
             
             <LayerLabel text="Audio Feedback" icon={Speaker} align="right" />
        </motion.div>

        {/* --- LAYER 6: CAMERA MOUNTS --- */}
        <motion.div 
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ translateZ: exploded ? 240 : 120 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             {/* Corner Cameras */}
             {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                 <motion.div key={i} className={`absolute ${pos} w-8 h-8 bg-black border border-red-500 flex items-center justify-center`}
                    animate={{ scale: exploded ? 1.5 : 1 }}
                 >
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                 </motion.div>
             ))}
             {/* Frustum Cones (Simulated) */}
             <div className="absolute inset-0 bg-red-500/5 mix-blend-screen" style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20% 20%, 80% 20%, 80% 80%, 20% 80%)'}}></div>

             <LayerLabel text="Camera Mounts" icon={Video} align="left" />
        </motion.div>

        {/* --- LAYER 5: SMART GLASS (Outer Walls) --- */}
        <motion.div 
             className="absolute inset-0 pointer-events-none"
             animate={{ translateZ: exploded ? 160 : 0 }}
             transition={{ duration: 1 }}
             style={{ transformStyle: 'preserve-3d' }}
        >
             {/* Back Glass */}
             <motion.div 
                className="absolute -top-[1px] left-0 right-0 h-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateX(-90deg) translateY(-100%)', transformOrigin: 'top center' }}
                animate={{ rotateX: -90, y: exploded ? -50 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />
             {/* Front Glass */}
             <motion.div 
                className="absolute -bottom-[1px] left-0 right-0 h-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateX(-90deg) translateY(0%)', transformOrigin: 'bottom center' }}
                animate={{ rotateX: -90, y: exploded ? 50 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />
             {/* Side Glass L */}
             <motion.div 
                className="absolute top-0 bottom-0 -left-[1px] w-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateY(-90deg) translateX(-50%)', transformOrigin: 'center left' }}
                animate={{ rotateY: -90, x: exploded ? -50 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />
             {/* Side Glass R */}
             <motion.div 
                className="absolute top-0 bottom-0 -right-[1px] w-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateY(90deg) translateX(50%)', transformOrigin: 'center right' }}
                animate={{ rotateY: 90, x: exploded ? 50 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />

             <LayerLabel text="Smart Glass" icon={Layers} align="right" />
        </motion.div>

        {/* --- LAYER 4: STRUCTURAL FRAME --- */}
        <motion.div 
             className="absolute inset-0 pointer-events-none border-2 border-gray-500"
             animate={{ translateZ: exploded ? 80 : 0 }}
             transition={{ duration: 1 }}
             style={{ transformStyle: 'preserve-3d' }}
        >
             {/* Corner Posts */}
             <div className="absolute top-0 left-0 w-2 h-2 bg-gray-400" style={{ transform: 'translateZ(0px)' }}></div>
             <div className="absolute top-0 right-0 w-2 h-2 bg-gray-400" style={{ transform: 'translateZ(0px)' }}></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 bg-gray-400" style={{ transform: 'translateZ(0px)' }}></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 bg-gray-400" style={{ transform: 'translateZ(0px)' }}></div>
             
             {/* Vertical Beams (simulated) */}
             <motion.div className="absolute top-0 left-0 w-[2px] h-32 bg-gray-400" style={{ transform: 'rotateX(-90deg) translateY(-100%)', transformOrigin: 'top left' }} />
             <motion.div className="absolute top-0 right-0 w-[2px] h-32 bg-gray-400" style={{ transform: 'rotateX(-90deg) translateY(-100%)', transformOrigin: 'top right' }} />
             
             <LayerLabel text="Structural Frame" icon={Maximize2} align="left" />
        </motion.div>

        {/* --- LAYER 3: SMART FLOOR (Base Z=0) --- */}
        <motion.div 
          className="absolute inset-0 bg-blue-900/10 border-2 border-neon-blue shadow-[0_0_50px_rgba(45,214,255,0.1)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Court Markings */}
          <div className="absolute inset-4 border-2 border-white/40"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40"></div>
          
          {/* Holographic Floor Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)_100%)] bg-[length:20px_20px] opacity-30"></div>
          
          {/* LED Boards (Inner Walls) - Attached to floor layer but can separate if needed. Keeping simple here. */}
          <motion.div 
            className="absolute bottom-0 left-[20%] right-[20%] h-1 bg-neon-lime shadow-[0_0_20px_#ACFF01]"
            animate={{ opacity: exploded ? 0 : 1 }}
          />
        </motion.div>

        {/* --- LAYER 2: SENSOR UNITS (Under Floor) --- */}
        <motion.div 
          className="absolute inset-4 grid grid-cols-6 grid-rows-4 gap-4"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ translateZ: exploded ? -80 : -5, opacity: exploded ? 1 : 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             {[...Array(24)].map((_, i) => (
                 <div key={i} className="w-full h-full flex items-center justify-center">
                     <div className="w-2 h-2 bg-neon-lime rounded-full shadow-[0_0_5px_#ACFF01]"></div>
                 </div>
             ))}
             <div className="absolute inset-0 bg-neon-lime/5 border border-neon-lime/20"></div>

             <LayerLabel text="Sensor Units" icon={Grid} align="right" />
        </motion.div>

        {/* --- LAYER 1: AI COMPUTE MODULE (Bottommost) --- */}
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-black border border-white/20"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ translateZ: exploded ? -160 : -10, opacity: exploded ? 1 : 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             {/* Chip Visual */}
             <div className="absolute inset-2 border border-white/10 bg-gray-900 flex items-center justify-center">
                 <Cpu size={48} className="text-white opacity-50" />
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]"></div>
             </div>
             {/* Data Lines connecting to floor */}
             {exploded && (
                 <>
                    <div className="absolute top-0 left-1/2 w-[1px] h-[80px] bg-white/20 origin-bottom" style={{ transform: 'rotateX(-90deg) translateY(-100%)' }}></div>
                 </>
             )}

             <LayerLabel text="AI Compute Module" icon={Server} align="left" />
        </motion.div>
        
        {/* Detail Overlay Card (Preserved from original) */}
        <AnimatePresence>
        {activeHotspot && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute top-24 right-8 w-80 bg-black/90 backdrop-blur-xl border border-neon-lime/30 p-6 z-40 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl pointer-events-auto"
          >
            {/* Content for card */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-sans font-bold text-xl text-white uppercase">Component Details</h3>
              <button onClick={() => setActiveHotspot(null)} className="text-gray-500 hover:text-white transition-colors">
                <Maximize2 size={16} />
              </button>
            </div>
            {/* ... rest of card ... */}
          </motion.div>
        )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};