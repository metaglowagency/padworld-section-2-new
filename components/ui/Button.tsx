import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = '' }) => {
  // Simpler, minimal, rectangular style from the Deck
  const baseStyles = "relative px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-white text-black hover:bg-neon-lime hover:text-black",
    secondary: "bg-neon-blue text-black hover:bg-white",
    outline: "border border-white/20 text-white hover:border-neon-lime hover:text-neon-lime",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
};