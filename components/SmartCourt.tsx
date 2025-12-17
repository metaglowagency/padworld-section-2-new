import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Layers, Video, Zap, Activity, Play, Pause, RotateCw, Cpu, Speaker, Lightbulb, Grid, Server, Scan } from 'lucide-react';

interface SmartCourtProps {
  demoMode?: boolean;
}

// Fixed Data for Layers - Zigzag pattern to avoid header and balance layout
const COURT_LAYERS = [
    {
        id: 'lighting',
        title: "Lighting Rails",
        sub: "Adaptive LED Arrays",
        desc: "High-lumen, anti-glare LED system that adjusts color temperature automatically based on time of day and match intensity.",
        icon: Lightbulb,
        side: 'right', // Right side to avoid Header
        topPosition: '15%' 
    },
    {
        id: 'audio',
        title: "Audio Feedback",
        sub: "360° Spatial Sound",
        desc: "Directional audio emitters create a spatial soundstage, providing auditory cues for 'out' calls and game status.",
        icon: Speaker,
        side: 'left',
        topPosition: '25%' // Adjusted for tighter layout
    },
    {
        id: 'vision',
        title: "Computer Vision",
        sub: "4K Optical Tracking",
        desc: "12 ultra-high-speed cameras capturing 10,000 fps. Tracks ball spin and player biometrics with zero latency.",
        icon: Video,
        side: 'right',
        topPosition: '35%'
    },
    {
        id: 'glass',
        title: "Smart Glass",
        sub: "Info HUD Panels",
        desc: "Reinforced transparent OLED panels acting as structural walls. Displays live scores, ads, and replay highlights.",
        icon: Layers,
        side: 'left',
        topPosition: '45%'
    },
    {
        id: 'frame',
        title: "Structural Frame",
        sub: "Carbon Fiber Monocoque",
        desc: "Aerospace-grade skeleton. Lightweight, ultra-durable, and fully modular for rapid assembly.",
        icon: Maximize2,
        side: 'right',
        topPosition: '55%'
    },
    {
        id: 'floor',
        title: "Smart Surface",
        sub: "Holographic Markings",
        desc: "Dynamic LED court lines that can shift for training drills or different game modes instantly.",
        icon: Activity,
        side: 'left',
        topPosition: '65%'
    },
    {
        id: 'sensors',
        title: "Sensor Matrix",
        sub: "Pressure Grid",
        desc: "Piezoelectric underfloor grid. Differentiates between player footfalls and ball bounces for line calls.",
        icon: Grid,
        side: 'right',
        topPosition: '75%'
    },
    {
        id: 'compute',
        title: "AI Compute",
        sub: "Edge Processing Unit",
        desc: "NVIDIA Orin-based unit processing all optical and sensor data locally for privacy and speed.",
        icon: Server,
        side: 'left',
        topPosition: '85%'
    }
];

export const SmartCourt: React.FC<SmartCourtProps> = ({ demoMode = false }) => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [cycleStatus, setCycleStatus] = useState("INITIALIZING");
  const [cycleProgress, setCycleProgress] = useState(0);
  
  // Refs for animations
  const rotationFrameRef = useRef<number>(0);
  const sequenceFrameRef = useRef<number>(0);

  // Handle Demo Mode Trigger (External Control)
  useEffect(() => {
    if (demoMode) {
        setIsAutoMode(false);
        const seq = async () => {
            setRotation(45); 
            await new Promise(r => setTimeout(r, 1000));
            setExploded(true);
            setHighlightedIndex(null); // Show all in demo mode initially
            await new Promise(r => setTimeout(r, 10000));
            setExploded(false);
        };
        seq();
    }
  }, [demoMode]);
  
  // Continuous Rotation Loop
  useEffect(() => {
    if (!isAutoMode) return;
    
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = time - lastTime;
      // Slow constant rotation
      setRotation(prev => (prev + (delta * 0.005)) % 360);
      lastTime = time;
      rotationFrameRef.current = requestAnimationFrame(animate);
    };
    
    rotationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rotationFrameRef.current);
  }, [isAutoMode]);

  // Autonomous Sequence Logic (Explode -> Iterate Sections -> Collapse)
  useEffect(() => {
    if (!isAutoMode || demoMode) {
        setCycleProgress(0);
        setCycleStatus("MANUAL OVERRIDE");
        setHighlightedIndex(null);
        return;
    }

    const LAYER_DISPLAY_TIME = 2000;
    const TRANSITION_TIME = 1500;
    const TOTAL_LAYERS = COURT_LAYERS.length;
    // Total cycle: Explode transition + (Layers * time) + Collapse transition + Wait
    const TOTAL_CYCLE_DURATION = TRANSITION_TIME + (TOTAL_LAYERS * LAYER_DISPLAY_TIME) + TRANSITION_TIME + 2000;

    let startTime = performance.now();

    const sequenceLoop = () => {
        const now = performance.now();
        const elapsed = (now - startTime) % TOTAL_CYCLE_DURATION;
        setCycleProgress((elapsed / TOTAL_CYCLE_DURATION) * 100);

        // PHASE 1: EXPLODE & PREPARE (0 -> TRANSITION_TIME)
        if (elapsed < TRANSITION_TIME) {
            if (!exploded) setExploded(true);
            setHighlightedIndex(null);
            setCycleStatus("SYSTEM DIAGNOSTIC: EXPLODING VIEW");
        }
        // PHASE 2: SEQUENTIAL HIGHLIGHTING
        else if (elapsed < TRANSITION_TIME + (TOTAL_LAYERS * LAYER_DISPLAY_TIME)) {
            const presentationTime = elapsed - TRANSITION_TIME;
            const activeIdx = Math.floor(presentationTime / LAYER_DISPLAY_TIME);
            
            if (activeIdx < TOTAL_LAYERS) {
                setHighlightedIndex(activeIdx);
                setCycleStatus(`ANALYZING COMPONENT: ${COURT_LAYERS[activeIdx].title.toUpperCase()}`);
            }
        }
        // PHASE 3: COLLAPSE
        else if (elapsed < TOTAL_CYCLE_DURATION - 2000) {
            setExploded(false);
            setHighlightedIndex(null);
            setCycleStatus("SYSTEM DIAGNOSTIC: COLLAPSING VIEW");
        }
        // PHASE 4: IDLE SPIN
        else {
             setExploded(false);
             setHighlightedIndex(null);
             setCycleStatus("SYSTEM IDLE");
        }

        sequenceFrameRef.current = requestAnimationFrame(sequenceLoop);
    };

    sequenceFrameRef.current = requestAnimationFrame(sequenceLoop);
    return () => cancelAnimationFrame(sequenceFrameRef.current);
  }, [isAutoMode, demoMode, exploded]); // Added exploded to deps to ensure state consistency if triggered externally

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center perspective-container overflow-hidden bg-holographic-grid bg-[length:40px_40px]">
      
      {/* Header Controls */}
      <div className="absolute top-8 left-8 z-30 space-y-4 pointer-events-none">
        <div className="flex items-center gap-2 mb-2 pointer-events-auto">
           {/* Autonomous Indicator */}
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md transition-colors ${isAutoMode ? 'border-neon-lime/30 bg-neon-lime/10' : 'border-gray-700 bg-black/50'}`}>
               <div className={`relative w-2 h-2`}>
                   <div className={`absolute inset-0 rounded-full ${isAutoMode ? 'bg-neon-lime animate-ping' : 'bg-gray-500'}`}></div>
                   <div className={`relative w-2 h-2 rounded-full ${isAutoMode ? 'bg-neon-lime' : 'bg-gray-500'}`}></div>
               </div>
               <span className={`font-mono text-[10px] tracking-widest uppercase ${isAutoMode ? 'text-neon-lime' : 'text-gray-500'}`}>
                   {isAutoMode ? 'AUTONOMOUS SEQ' : 'MANUAL OVERRIDE'}
               </span>
           </div>
        </div>
        <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter text-white leading-[0.9]">
          Smart Court <span className="text-neon-lime">V2.0</span>
        </h2>
        
        {/* Cycle Progress Bar (Only in Auto Mode) */}
        <AnimatePresence>
            {isAutoMode && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-64"
                >
                    <div className="flex justify-between text-[9px] font-mono text-gray-500 mb-1">
                        <span className="text-neon-lime">{cycleStatus}</span>
                        <span>{Math.round(cycleProgress)}%</span>
                    </div>
                    <div className="w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-neon-lime shadow-[0_0_10px_#ACFF01]" 
                            style={{ width: `${cycleProgress}%` }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-24 left-8 z-30 pointer-events-none md:bottom-8 md:left-auto md:right-8 md:text-right">
         <div className="text-[9px] text-gray-600 font-mono uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            * 3D Visualization Demo
         </div>
      </div>

      {/* Floating Control Bar */}
      <div className="absolute bottom-6 z-30 flex items-center gap-4 bg-black/80 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-2xl scale-90 md:scale-100">
         <button 
           onClick={() => setIsAutoMode(!isAutoMode)}
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

      {/* --- 2D DOCUMENTATION OVERLAY (Fixed on top of 3D) --- */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          <AnimatePresence>
              {exploded && COURT_LAYERS.map((layer, index) => {
                  const isActive = highlightedIndex === null || highlightedIndex === index;
                  const isHighlighted = highlightedIndex === index;
                  
                  return (
                    <motion.div
                        key={layer.id}
                        initial={{ opacity: 0, x: layer.side === 'left' ? -50 : 50 }}
                        animate={{ 
                            opacity: isActive ? 1 : 0.1, 
                            x: 0,
                            scale: isHighlighted ? 1.05 : 1
                        }}
                        exit={{ opacity: 0, x: layer.side === 'left' ? -50 : 50 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute ${layer.side === 'left' ? 'left-4 md:left-12' : 'right-4 md:right-12'} w-64 md:w-80`}
                        style={{ top: layer.topPosition }}
                    >
                        <div className={`flex items-center gap-4 ${layer.side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
                            {/* Text Card */}
                            <div className={`
                                transition-all duration-500
                                ${isHighlighted ? 'bg-neon-lime/10 border-neon-lime shadow-[0_0_20px_rgba(172,255,1,0.2)]' : 'bg-black/80 border-white/10'}
                                backdrop-blur-md border p-3 rounded-xl shadow-2xl flex-1 ${layer.side === 'left' ? 'text-right' : 'text-left'}
                            `}>
                                <div className={`flex items-center gap-2 mb-1 ${layer.side === 'left' ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`${isHighlighted ? 'text-white' : 'text-neon-lime'} font-bold text-sm uppercase tracking-wider`}>{layer.title}</span>
                                    <layer.icon size={14} className={isHighlighted ? 'text-white' : 'text-neon-lime'} />
                                </div>
                                <div className="text-white text-xs font-mono mb-2 opacity-80">{layer.sub}</div>
                                <p className="text-[10px] text-gray-400 leading-relaxed border-t border-white/10 pt-2 hidden md:block">
                                    {layer.desc}
                                </p>
                            </div>

                            {/* Connector Line */}
                            <div className="flex-shrink-0 flex items-center">
                                <div className={`w-2 h-2 rounded-full ${isHighlighted ? 'bg-white shadow-[0_0_15px_white]' : 'bg-neon-lime shadow-[0_0_10px_#ACFF01]'}`} />
                                <div className={`h-[1px] bg-gradient-to-r from-neon-lime to-transparent w-8 md:w-16 opacity-50 ${layer.side === 'left' ? '' : 'rotate-180'}`} />
                            </div>
                        </div>
                    </motion.div>
                  );
              })}
          </AnimatePresence>
      </div>

      {/* --- 3D SCENE --- */}
      <motion.div 
        className="relative w-[260px] h-[180px] md:w-[420px] md:h-[280px] mt-16 md:mt-20"
        style={{ 
          transformStyle: 'preserve-3d',
          rotateX: 60, 
          rotateZ: rotation
        }}
      >
        {/* Helper to determine if a specific 3D layer should be highlighted */}
        {/* If highlightedIndex is null, all layers are "normal". If set, only that one is full opacity, others dim. */}
        
        {/* LAYER 8: LIGHTING (Top) */}
        <motion.div 
          className="absolute inset-0 border border-white/50"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ 
              translateZ: exploded ? 350 : 120, 
              opacity: exploded ? (highlightedIndex === 0 || highlightedIndex === null ? 1 : 0.1) : 0.1 
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             <div className="absolute inset-0 grid grid-cols-4 gap-4">
                 {[...Array(4)].map((_, i) => (
                     <div key={i} className="h-full border-r border-white/30 flex items-center justify-center">
                         <div className="w-1 h-full bg-white/20 blur-[1px]"></div>
                     </div>
                 ))}
             </div>
             {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                 <div key={i} className={`absolute ${pos} w-4 h-4 bg-white shadow-[0_0_20px_white]`} />
             ))}
        </motion.div>

        {/* LAYER 7: AUDIO */}
        <motion.div 
          className="absolute inset-10 border border-neon-blue/30 rounded-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ 
              translateZ: exploded ? 280 : 100, 
              opacity: exploded ? (highlightedIndex === 1 || highlightedIndex === null ? 1 : 0.1) : 0 
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-neon-blue/20 border border-neon-blue"></div>
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-neon-blue/20 border border-neon-blue"></div>
             <div className="absolute inset-0 border border-dashed border-neon-blue/20 rounded-full animate-pulse"></div>
        </motion.div>

        {/* LAYER 6: CAMERAS */}
        <motion.div 
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ 
              translateZ: exploded ? 210 : 120,
              opacity: exploded ? (highlightedIndex === 2 || highlightedIndex === null ? 1 : 0.1) : 1
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                 <motion.div key={i} className={`absolute ${pos} w-8 h-8 bg-black border border-neon-lime flex items-center justify-center shadow-[0_0_15px_#ACFF01]`}
                    animate={{ scale: exploded ? 1.3 : 1 }}
                 >
                     <div className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-neon-lime rounded-full animate-pulse"></div>
                     </div>
                 </motion.div>
             ))}
             {/* Frustum Visuals */}
             <div className="absolute inset-0 bg-neon-lime/5 mix-blend-screen pointer-events-none" style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20% 20%, 80% 20%, 80% 80%, 20% 80%)'}}>
                 <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(172,255,1,0.05)_10px,rgba(172,255,1,0.05)_11px)]"></div>
             </div>
        </motion.div>

        {/* LAYER 5: GLASS */}
        <motion.div 
             className="absolute inset-0 pointer-events-none"
             animate={{ 
                 translateZ: exploded ? 140 : 0,
                 opacity: exploded ? (highlightedIndex === 3 || highlightedIndex === null ? 1 : 0.1) : 1
             }}
             transition={{ duration: 1 }}
             style={{ transformStyle: 'preserve-3d' }}
        >
             <motion.div 
                className="absolute -top-[1px] left-0 right-0 h-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateX(-90deg) translateY(-100%)', transformOrigin: 'top center' }}
                animate={{ rotateX: -90, y: exploded ? -40 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />
             <motion.div 
                className="absolute -bottom-[1px] left-0 right-0 h-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateX(-90deg) translateY(0%)', transformOrigin: 'bottom center' }}
                animate={{ rotateX: -90, y: exploded ? 40 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />
             <motion.div 
                className="absolute top-0 bottom-0 -left-[1px] w-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateY(-90deg) translateX(-50%)', transformOrigin: 'center left' }}
                animate={{ rotateY: -90, x: exploded ? -40 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />
             <motion.div 
                className="absolute top-0 bottom-0 -right-[1px] w-32 bg-blue-400/10 border border-blue-400/30"
                style={{ transform: 'rotateY(90deg) translateX(50%)', transformOrigin: 'center right' }}
                animate={{ rotateY: 90, x: exploded ? 40 : 0, opacity: exploded ? 0.6 : 0.3 }}
             />
        </motion.div>

        {/* LAYER 4: FRAME */}
        <motion.div 
             className="absolute inset-0 pointer-events-none border-2 border-gray-500"
             animate={{ 
                 translateZ: exploded ? 70 : 0,
                 opacity: exploded ? (highlightedIndex === 4 || highlightedIndex === null ? 1 : 0.1) : 1
             }}
             transition={{ duration: 1 }}
             style={{ transformStyle: 'preserve-3d' }}
        >
             <div className="absolute top-0 left-0 w-2 h-2 bg-gray-400"></div>
             <div className="absolute top-0 right-0 w-2 h-2 bg-gray-400"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 bg-gray-400"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 bg-gray-400"></div>
             
             <motion.div className="absolute top-0 left-0 w-[2px] h-32 bg-gray-400" style={{ transform: 'rotateX(-90deg) translateY(-100%)', transformOrigin: 'top left' }} />
             <motion.div className="absolute top-0 right-0 w-[2px] h-32 bg-gray-400" style={{ transform: 'rotateX(-90deg) translateY(-100%)', transformOrigin: 'top right' }} />
        </motion.div>

        {/* LAYER 3: FLOOR (Z=0) */}
        <motion.div 
          className="absolute inset-0 bg-blue-900/10 border-2 border-neon-blue shadow-[0_0_50px_rgba(45,214,255,0.1)]"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
              opacity: exploded ? (highlightedIndex === 5 || highlightedIndex === null ? 1 : 0.1) : 1
          }}
        >
          <div className="absolute inset-4 border-2 border-white/40"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)_100%)] bg-[length:20px_20px] opacity-30"></div>
          <motion.div 
            className="absolute bottom-0 left-[20%] right-[20%] h-1 bg-neon-lime shadow-[0_0_20px_#ACFF01]"
            animate={{ opacity: exploded ? 0 : 1 }}
          />
        </motion.div>

        {/* LAYER 2: SENSORS */}
        <motion.div 
          className="absolute inset-4"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ 
              translateZ: exploded ? -70 : -5, 
              opacity: exploded ? (highlightedIndex === 6 || highlightedIndex === null ? 1 : 0.1) : 0 
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             <div className="w-full h-full grid grid-cols-8 grid-rows-6 gap-2">
                {[...Array(48)].map((_, i) => (
                    <motion.div 
                        key={i} 
                        className="w-full h-full flex items-center justify-center relative"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: Math.random() * 2 + 1, repeat: Infinity }}
                    >
                        <div className="w-1 h-1 bg-neon-lime rounded-full"></div>
                        <div className="absolute inset-0 border-[0.5px] border-neon-lime/10"></div>
                    </motion.div>
                ))}
             </div>
             <motion.div 
                className="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-transparent via-neon-lime/30 to-transparent"
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             />
             <div className="absolute inset-0 bg-neon-lime/5 border border-neon-lime/20"></div>
        </motion.div>

        {/* LAYER 1: COMPUTE */}
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-black border border-white/20"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ 
              translateZ: exploded ? -140 : -10, 
              opacity: exploded ? (highlightedIndex === 7 || highlightedIndex === null ? 1 : 0.1) : 0 
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
             <div className="absolute inset-2 border border-white/10 bg-gray-900 flex items-center justify-center">
                 <Cpu size={48} className="text-white opacity-50" />
                 <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]"></div>
             </div>
             {exploded && (
                <div className="absolute top-0 left-1/2 w-[1px] h-[80px] bg-white/20 origin-bottom" style={{ transform: 'rotateX(-90deg) translateY(-100%)' }}></div>
             )}
        </motion.div>

      </motion.div>
    </div>
  );
};