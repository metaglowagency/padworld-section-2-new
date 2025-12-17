import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SectionDividerProps {
  localImage?: string; // The filename in public folder (e.g., "section_1.jpg")
  fallbackImage: string; // The Unsplash URL
  title: string;
  subtitle?: string;
  slogan?: string; // NEW PROP
  align?: 'left' | 'center' | 'right';
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ localImage, fallbackImage, title, subtitle, slogan, align = 'center' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(localImage ? `/${localImage}` : fallbackImage);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const sloganY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]); // Parallax for slogan
  const opacityText = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  const handleImageError = () => {
    if (imgSrc !== fallbackImage) {
        setImgSrc(fallbackImage);
    }
  };

  return (
    <div ref={ref} className="relative h-[60vh] overflow-hidden flex items-center justify-center border-y border-white/5 bg-black perspective-container">
      {/* Parallax Image Background */}
      <motion.div 
        style={{ y, scale: scaleImage }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Darker dim for better text contrast */}
        <img 
            src={imgSrc} 
            alt={title} 
            onError={handleImageError}
            className="w-full h-[140%] object-cover grayscale opacity-60 mix-blend-screen" 
        />
      </motion.div>

      {/* Vignette & Scanlines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 pointer-events-none opacity-20" />

      {/* Massive Background Slogan (Watermark) */}
      {slogan && (
        <motion.div 
          style={{ y: sloganY }}
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden"
        >
          <span className="font-display font-black text-[12vw] text-white/[0.03] whitespace-nowrap tracking-tighter leading-none select-none">
            {slogan}
          </span>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div 
        style={{ opacity: opacityText }}
        className={`relative z-30 px-6 md:px-12 max-w-7xl w-full ${align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right'}`}
      >
        {subtitle && (
            <div className={`flex items-center gap-4 mb-4 ${align === 'center' ? 'justify-center' : align === 'left' ? 'justify-start' : 'justify-end'}`}>
                <div className="h-[1px] w-8 bg-neon-lime"></div>
                <p className="text-neon-lime font-mono text-xs md:text-sm tracking-[0.3em] uppercase glow-text">
                    {subtitle}
                </p>
                {align === 'center' && <div className="h-[1px] w-8 bg-neon-lime"></div>}
            </div>
        )}
        
        <h2 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter text-white leading-[0.85] drop-shadow-2xl mix-blend-overlay">
            {title}
        </h2>
        
        {/* Foreground Slogan Repeat (Tech Style) */}
        {slogan && (
            <div className="mt-4 overflow-hidden">
                <motion.div 
                    initial={{ x: "-100%" }}
                    whileInView={{ x: "0%" }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className={`text-xs font-mono text-gray-400 tracking-widest uppercase ${align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right'}`}
                >
                    [{slogan}]
                </motion.div>
            </div>
        )}
      </motion.div>
    </div>
  );
};