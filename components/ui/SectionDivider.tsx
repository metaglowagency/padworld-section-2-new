import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SectionDividerProps {
  localImage?: string; // The filename in public folder (e.g., "section_1.jpg")
  fallbackImage: string; // The Unsplash URL
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ localImage, fallbackImage, title, subtitle, align = 'center' }) => {
  const ref = useRef<HTMLDivElement>(null);
  // Default to local image if provided, otherwise fallback
  const [imgSrc, setImgSrc] = useState(localImage ? `/${localImage}` : fallbackImage);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacityText = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  const handleImageError = () => {
    // If the local image fails (doesn't exist), switch to fallback
    if (imgSrc !== fallbackImage) {
        setImgSrc(fallbackImage);
    }
  };

  return (
    <div ref={ref} className="relative h-[60vh] overflow-hidden flex items-center justify-center border-y border-white/5 bg-black">
      {/* Parallax Image Background */}
      <motion.div 
        style={{ y, scale: scaleImage }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dimmer */}
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

      {/* Content */}
      <motion.div 
        style={{ opacity: opacityText }}
        className={`relative z-30 px-6 md:px-12 max-w-7xl w-full ${align === 'center' ? 'text-center' : align === 'left' ? 'text-left' : 'text-right'}`}
      >
        {subtitle && (
            <div className="flex items-center gap-4 justify-center mb-6">
                <div className="h-[1px] w-12 bg-neon-lime"></div>
                <p className="text-neon-lime font-mono text-xs md:text-sm tracking-[0.3em] uppercase glow-text">
                    {subtitle}
                </p>
                <div className="h-[1px] w-12 bg-neon-lime"></div>
            </div>
        )}
        <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-400 to-gray-900 leading-[0.85] drop-shadow-2xl">
            {title}
        </h2>
      </motion.div>
    </div>
  );
};