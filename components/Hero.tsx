import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ChevronDown, Zap, Globe, Cpu, Video, Loader2, Upload, ImageIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for media handling
  // We prioritize: 
  // 1. Manually uploaded file (via HUD)
  // 2. Local public file (hero_bg.mp4 / hero_bg.jpg)
  // 3. Fallback default Unsplash image
  const [heroMediaUrl, setHeroMediaUrl] = useState<string | null>('/hero_bg.mp4'); 
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [useFallback, setUseFallback] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const url = URL.createObjectURL(file);
        setHeroMediaUrl(url);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
        setUseFallback(false);
    }
  };

  const handleMediaError = () => {
      // If the current media (e.g. hero_bg.mp4) fails to load
      if (heroMediaUrl === '/hero_bg.mp4') {
          // Try local image next
          setHeroMediaUrl('/hero_bg.jpg');
          setMediaType('image');
      } else if (heroMediaUrl === '/hero_bg.jpg') {
          // If local image fails, go to Unsplash fallback
          setHeroMediaUrl(null); 
          setUseFallback(true);
      }
  };

  const generateBackgroundVideo = async () => {
    // Check for API Key first (Required for Veo)
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Check again after dialog
        if (!await window.aistudio.hasSelectedApiKey()) return;
    }

    setIsGenerating(true);
    setGenerationStatus('INITIALIZING VEO...');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        setGenerationStatus('GENERATING FRAMES...');
        
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: 'Cinematic establishing shot of a futuristic cyberpunk padel tennis court, neon lime and blue laser lights, dark foggy atmosphere, 4k, hyper-realistic, slow camera pan',
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: '16:9'
            }
        });

        // Polling loop
        while (!operation.done) {
            setGenerationStatus('RENDERING VIDEO...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
            setGenerationStatus('DOWNLOADING...');
            const downloadLink = operation.response.generatedVideos[0].video.uri;
            const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setHeroMediaUrl(url);
            setMediaType('video');
            setUseFallback(false);
        } else {
            console.error("No video in response", operation);
            setGenerationStatus('FAILED');
        }

    } catch (error) {
        console.error("Video generation failed:", error);
        setGenerationStatus('ERROR');
    } finally {
        setIsGenerating(false);
        setGenerationStatus('');
    }
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
         {/* Hybrid Video/Image Background */}
         <div className="absolute inset-0 bg-black">
             {!useFallback && mediaType === 'video' && heroMediaUrl ? (
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
             ) : !useFallback && mediaType === 'image' && heroMediaUrl ? (
                <img 
                    src={heroMediaUrl}
                    onError={handleMediaError}
                    alt="Hero Background"
                    className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 contrast-125 mix-blend-luminosity"
                />
             ) : (
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat grayscale brightness-50 contrast-125 mix-blend-luminosity"></div>
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

      {/* 3. Floating Particles/Debris */}
       <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute w-1 h-1 bg-neon-lime rounded-full"
               initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
               animate={{ 
                 y: [null, Math.random() * -100], 
                 opacity: [0, 1, 0] 
               }}
               transition={{ 
                 duration: Math.random() * 5 + 3, 
                 repeat: Infinity, 
                 delay: Math.random() * 5 
               }}
             />
          ))}
       </div>

      {/* 4. Main Typography & Content */}
      <motion.div 
        style={{ opacity: opacityText, scale: scaleText }}
        className="relative z-10 w-full max-w-[1400px] px-6 flex flex-col items-center text-center"
      >
         {/* Background Watermark */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
            <h1 className="text-[15vw] font-black text-white opacity-[0.03] tracking-tighter blur-sm whitespace-nowrap">
              PADWORLD
            </h1>
         </div>

         {/* HUD Top Marker */}
         <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: 64 }} 
            transition={{ delay: 0.5 }}
            className="w-[1px] bg-gradient-to-b from-transparent via-neon-lime to-transparent mb-8" 
         />
         
         {/* Pre-title Label */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.8 }}
           className="flex items-center gap-3 mb-6 relative z-10"
         >
           <div className="flex items-center gap-1">
             <span className="block w-1 h-1 bg-neon-blue rounded-full"></span>
             <span className="block w-1 h-1 bg-neon-blue rounded-full"></span>
             <span className="block w-1 h-1 bg-neon-blue rounded-full"></span>
           </div>
           <span className="font-mono text-[10px] text-neon-blue tracking-[0.4em] uppercase">System Online V2.4</span>
           <div className="flex items-center gap-1">
             <span className="block w-1 h-1 bg-neon-blue rounded-full"></span>
             <span className="block w-1 h-1 bg-neon-blue rounded-full"></span>
             <span className="block w-1 h-1 bg-neon-blue rounded-full"></span>
           </div>
         </motion.div>

         {/* Hero Title */}
         <div className="relative mb-8 z-10">
            {/* Main Text */}
            <h1 className="relative text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] z-10">
              <span className="inline-block overflow-hidden pb-4">
                 <motion.span 
                   initial={{ y: "100%" }} 
                   animate={{ y: 0 }} 
                   transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   className="block"
                 >
                   BEYOND
                 </motion.span>
              </span>
              <br />
              <span className="inline-block overflow-hidden pb-4">
                 <motion.span 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="block text-transparent bg-clip-text bg-gradient-to-b from-neon-lime to-transparent"
                 >
                   THE COURT
                 </motion.span>
              </span>
            </h1>
         </div>

         {/* Subtitle / Description */}
         <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.2, duration: 1 }}
           className="max-w-xl text-gray-400 font-light text-sm md:text-lg leading-relaxed tracking-wide mb-12 relative z-10"
         >
           The first decentralized sports ecosystem powered by artificial intelligence. 
           Connect, compete, and evolve in the <span className="text-white font-medium">ultimate digital arena</span>.
         </motion.p>

         {/* CTA Buttons */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1.4 }}
           className="flex flex-col md:flex-row gap-6 items-center relative z-10"
         >
            <button className="group relative px-8 py-4 bg-neon-lime text-black font-mono font-bold text-xs uppercase tracking-widest overflow-hidden">
               <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
               <span className="relative z-10 flex items-center gap-2">
                 Initialize <Zap size={14} />
               </span>
            </button>
            <button className="group px-8 py-4 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-widest hover:border-white transition-colors">
               <span className="flex items-center gap-2">
                 Watch Keynote <Globe size={14} />
               </span>
            </button>
         </motion.div>
      </motion.div>
      
      {/* 5. HUD Corners */}
      <div className="absolute top-0 left-0 p-8 opacity-50 pointer-events-none z-20">
         <div className="w-48 h-48 border-l-2 border-t-2 border-neon-blue/30 rounded-tl-3xl relative pointer-events-auto p-4 flex flex-col gap-2">
            <div className="font-mono text-[9px] text-neon-blue mb-2">
               COORD: {Math.random().toFixed(4)} <br/>
               SYNC: AUTO
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*,video/*"
            />

            {/* GENERATE VIDEO BUTTON */}
             <button 
                onClick={generateBackgroundVideo}
                disabled={isGenerating}
                className="flex items-center gap-2 px-2 py-1.5 bg-white/10 hover:bg-neon-lime hover:text-black border border-white/20 rounded text-[9px] font-mono text-gray-300 transition-colors w-full justify-start"
             >
                {isGenerating ? <Loader2 size={10} className="animate-spin" /> : <Video size={10} />}
                {isGenerating ? generationStatus : 'GENERATE AI VIDEO'}
             </button>

             {/* UPLOAD BUTTON */}
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-2 py-1.5 bg-white/10 hover:bg-neon-blue hover:text-black border border-white/20 rounded text-[9px] font-mono text-gray-300 transition-colors w-full justify-start"
             >
                <Upload size={10} />
                UPLOAD VISUAL
             </button>
         </div>
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-50 pointer-events-none">
         <div className="w-32 h-32 border-r-2 border-t-2 border-neon-blue/30 rounded-tr-3xl relative">
             <Cpu size={16} className="absolute top-4 right-4 text-neon-blue/50" />
         </div>
      </div>
      <div className="absolute bottom-0 left-0 p-8 opacity-50 pointer-events-none">
         <div className="w-32 h-32 border-l-2 border-b-2 border-neon-blue/30 rounded-bl-3xl"></div>
      </div>
      <div className="absolute bottom-0 right-0 p-8 opacity-50 pointer-events-none">
         <div className="w-32 h-32 border-r-2 border-b-2 border-neon-blue/30 rounded-br-3xl"></div>
      </div>

      {/* 6. Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2 z-20"
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
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,black_100%)]"></div>
    </section>
  );
};