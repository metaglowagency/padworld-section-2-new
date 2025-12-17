import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Globe } from 'lucide-react';

// --- SCRAMBLE TEXT COMPONENT (DECRYPTION EFFECT) ---
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?~_=-+";

const ScrambleText: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = "", delay = 0 }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(true);

  useEffect(() => {
    let pos = 0;
    let timeout: NodeJS.Timeout;

    const scramble = () => {
      const scrambled = text.split('').map((char, index) => {
        if (index < pos) return char;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');

      setDisplayText(scrambled);

      if (pos < text.length) {
        if (Math.random() > 0.5) pos += 1 / CYCLES_PER_LETTER;
        timeout = setTimeout(scramble, SHUFFLE_TIME);
      } else {
        setIsScrambling(false);
      }
    };

    const startTimeout = setTimeout(() => {
        scramble();
    }, delay * 1000);

    return () => {
        clearTimeout(timeout);
        clearTimeout(startTimeout);
    };
  }, [text, delay]);

  return (
    <span className={`${className} ${isScrambling ? 'opacity-80' : 'opacity-100'}`}>
      {displayText}
    </span>
  );
};

// --- DYNAMIC SLOGAN ROTATOR ---
const SLOGANS = [
    "REDEFINING PHYSICS",
    "DIGITIZING ATHLETICISM",
    "THE INFINITE GAME",
    "PRECISION ENGINEERED",
    "FUTURE PROOF PROTOCOL"
];

const SloganRotator = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % SLOGANS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-6 overflow-hidden relative flex justify-center items-center w-full mb-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute font-mono text-neon-blue text-xs md:text-sm tracking-[0.4em] uppercase font-bold text-center"
                >
                    // {SLOGANS[index]} //
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// --- FLOATING INVESTOR DATA HUD ---
const InvestorHUD: React.FC<{ x: number; y: number; label: string; value: string; delay: number }> = ({ x, y, label, value, delay }) => (
    <motion.div 
        className="absolute z-0 hidden md:flex flex-col items-start p-3 bg-black/40 border border-white/10 backdrop-blur-sm rounded-sm"
        style={{ top: `${y}%`, left: `${x}%` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1, y: [0, -10, 0] }}
        transition={{ 
            opacity: { delay, duration: 1 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay }
        }}
    >
        <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-1">{label}</div>
        <div className="text-neon-lime font-mono font-bold text-sm">{value}</div>
        <div className="w-full h-[1px] bg-white/20 mt-2 relative">
             <motion.div 
                className="absolute top-0 left-0 h-full bg-neon-lime" 
                animate={{ width: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, delay }}
             />
        </div>
    </motion.div>
);

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Media Routing Logic: Try local video first, fallback to image on error
  const heroMediaUrl = '/hero_bg.mp4'; 
  const mediaType = 'video';
  const [useFallback, setUseFallback] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scaleText = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  // Spring physics for smooth mouse follow
  const x = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const y = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMediaError = () => {
      console.warn("Hero video failed to load, switching to fallback image.");
      setUseFallback(true);
  };

  return (
    <section 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black selection:bg-neon-lime selection:text-black"
    >
      {/* 1. Dynamic Background Layer */}
      <motion.div 
        style={{ y: yBg, scale: 1.1, x: useTransform(x, [-0.5, 0.5], [-20, 20]), opacity: 0.6 }} 
        className="absolute inset-0 z-0"
      >
         <div className="absolute inset-0 bg-black">
             {!useFallback && mediaType === 'video' ? (
                 <video 
                    ref={videoRef}
                    src={heroMediaUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    onError={handleMediaError}
                    className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 contrast-125 mix-blend-luminosity animate-in fade-in duration-1000"
                 />
             ) : (
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=200&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat grayscale brightness-50 contrast-125 mix-blend-luminosity"></div>
             )}
         </div>
         
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
      </motion.div>

      {/* 2. Grid Floor & Ceiling (Pseudo-3D) */}
      <div className="absolute inset-0 z-0 perspective-container pointer-events-none">
         <motion.div 
           style={{ rotateX: 60, scale: 2 }}
           animate={{ translateY: [0, 40] }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="absolute top-[60%] -left-[50%] -right-[50%] h-[100%] bg-[linear-gradient(rgba(45,214,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(45,214,255,0.1)_1px,transparent_1px)] bg-[length:100px_100px] opacity-30 transform-gpu"
         />
      </div>

      {/* 3. Background Data HUDs (Investor "Wow" Factor) */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <InvestorHUD x={10} y={20} label="Market CAGR" value="+14.2%" delay={0.5} />
          <InvestorHUD x={80} y={15} label="Global TAM" value="$50.2B" delay={1.2} />
          <InvestorHUD x={15} y={75} label="Token Velocity" value="HIGH" delay={2.0} />
          <InvestorHUD x={85} y={65} label="Active Nodes" value="4,291" delay={2.8} />
      </div>

      {/* 4. Main Typography & Content */}
      <motion.div 
        style={{ opacity: opacityText, scale: scaleText }}
        className="relative z-10 w-full max-w-[1400px] px-6 flex flex-col items-center text-center"
      >
         {/* HUD Top Marker */}
         <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: 64 }} 
            transition={{ delay: 0.5 }}
            className="w-[1px] bg-gradient-to-b from-transparent via-neon-lime to-transparent mb-6" 
         />
         
         {/* Dynamic Slogan Rotator */}
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
         >
            <SloganRotator />
         </motion.div>

         {/* KINETIC HERO TITLE (DECRYPTION EFFECT) */}
         <div className="relative mb-6 z-10 perspective-container flex flex-col items-center">
            <h1 className="font-display font-black text-6xl md:text-9xl text-white tracking-tighter leading-[0.85]">
                <ScrambleText text="BEYOND" delay={0.2} />
            </h1>
            <h1 className="font-display font-black text-6xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-neon-lime to-green-900 tracking-tighter leading-[0.85] mt-2 filter drop-shadow-[0_0_20px_rgba(172,255,1,0.3)]">
                <ScrambleText text="THE COURT" delay={1.5} className="glow-text" />
            </h1>
         </div>

         {/* Subtitle */}
         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 2.5, duration: 1 }}
           className="max-w-2xl text-gray-300 font-light text-sm md:text-lg leading-relaxed tracking-wide mb-10 relative z-10 border-l-2 border-neon-blue/50 pl-6 text-left md:text-center md:border-l-0 md:pl-0 font-sans"
         >
           The first <span className="text-white font-medium">decentralized sports ecosystem</span> powered by artificial intelligence. 
           We are digitizing the physical world to create the <span className="text-neon-lime font-medium">ultimate digital arena</span>.
         </motion.p>

         {/* CTA Buttons */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 2.8 }}
           className="flex flex-col md:flex-row gap-6 items-center relative z-10"
         >
            <button className="group relative px-10 py-5 bg-neon-lime text-black font-mono font-bold text-xs uppercase tracking-widest overflow-hidden hover:shadow-[0_0_40px_#ACFF01] transition-shadow duration-300 clip-path-slant">
               <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
               <span className="relative z-10 flex items-center gap-2">
                 INITIALIZE DECK <Zap size={14} fill="currentColor" />
               </span>
            </button>
            <button className="group px-10 py-5 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-widest hover:border-white transition-colors hover:bg-white/5 clip-path-slant">
               <span className="flex items-center gap-2">
                 WATCH KEYNOTE <Globe size={14} />
               </span>
            </button>
         </motion.div>
      </motion.div>
      
      {/* 5. HUD Corners - Left Side Only for Aesthetic (Buttons Removed) */}
      <div className="absolute top-32 left-0 p-8 opacity-50 pointer-events-none z-20">
         <div className="w-48 h-48 border-l-2 border-t-2 border-neon-blue/30 rounded-tl-3xl relative p-4 flex flex-col gap-2">
            <div className="font-mono text-[9px] text-neon-blue mb-2">
               SECURE CONNECTION <br/>
               ENCRYPTION: AES-256
            </div>
         </div>
      </div>
      
      {/* 6. Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1 }}
        className="absolute bottom-32 flex flex-col items-center gap-2 z-20"
      >
         <span className="font-mono text-[9px] text-gray-500 tracking-widest uppercase">Scroll to Enter</span>
         <motion.div 
           animate={{ y: [0, 5, 0] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
         >
            <ChevronDown className="text-neon-lime" size={20} />
         </motion.div>
      </motion.div>

      {/* 7. Vignette Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)]"></div>
    </section>
  );
};