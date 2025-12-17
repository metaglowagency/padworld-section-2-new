import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, ChevronRight } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

const BackgroundParticles: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Deep Void Background */}
            <div className="absolute inset-0 bg-black z-0" />
            
            {/* Subtle Grid - Static */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Floating Data Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-20"
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%", 
                        opacity: Math.random() * 0.3 
                    }}
                    animate={{ 
                        y: [null, Math.random() * -20 + "%"], // Slowly float up
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ 
                        duration: Math.random() * 10 + 10, 
                        repeat: Infinity, 
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [passphrase, setPassphrase] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'approved'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (status === 'idle') {
        inputRef.current?.focus();
    }
  }, [status]);

  // Keep focus if user clicks away
  useEffect(() => {
      const keepFocus = () => status === 'idle' && inputRef.current?.focus();
      window.addEventListener('click', keepFocus);
      return () => window.removeEventListener('click', keepFocus);
  }, [status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassphrase(e.target.value.toUpperCase()); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;

    // --- CONFIGURATION: CHANGE PASSWORD HERE ---
    const CORRECT_PASSWORD = 'PADWORLD'; 

    if (passphrase.trim() === CORRECT_PASSWORD) {
      setStatus('approved');
      
      // Cinematic pause before unlocking
      setTimeout(() => {
        onAuthenticated();
      }, 1500);
    } else {
      setStatus('checking');
      
      // Error shake/reset
      setTimeout(() => {
        setStatus('idle');
        setPassphrase('');
      }, 600);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black font-sans text-white flex flex-col items-center justify-center overflow-hidden cursor-none selection:bg-white selection:text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <BackgroundParticles />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center space-y-12">
          
          {/* Header Block */}
          <div className="flex flex-col items-center space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-gray-500 uppercase"
              >
                  PadWorld OS // v2.4.0
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
              >
                <h1 className="text-4xl md:text-6xl font-medium font-display tracking-tight text-white mb-2">
                    SECTION 02
                </h1>
                <h2 className="text-xl md:text-2xl font-light text-gray-400 tracking-widest uppercase">
                    The Revolution
                </h2>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-2 px-3 py-1 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm"
              >
                <Lock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-300">
                    Restricted Access — Authorization Required
                </span>
              </motion.div>
          </div>

          {/* Input Block */}
          <div className="w-full max-w-md relative min-h-[80px] flex items-center justify-center">
             <AnimatePresence mode="wait">
                 {status === 'approved' ? (
                     <motion.div
                        key="approved"
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        className="flex flex-col items-center gap-4"
                     >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                        >
                            <ShieldCheck className="w-6 h-6" />
                        </motion.div>
                        <span className="text-sm font-mono tracking-[0.2em] text-white uppercase animate-pulse">
                            Access Approved
                        </span>
                     </motion.div>
                 ) : (
                     <motion.form 
                        key="input"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ delay: 1 }}
                        className="relative group w-full"
                     >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-white">
                            <ChevronRight className="w-4 h-4 animate-pulse" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={passphrase}
                            onChange={handleInputChange}
                            className={`w-full bg-transparent border-b ${status === 'checking' ? 'border-red-500 text-red-500' : 'border-white/20 focus:border-white text-white'} py-3 pl-8 text-center font-mono text-lg uppercase tracking-[0.2em] outline-none transition-all duration-300 placeholder:text-gray-800`}
                            placeholder="ACCESS PHRASE"
                            autoComplete="off"
                            spellCheck={false}
                        />
                     </motion.form>
                 )}
             </AnimatePresence>
          </div>

      </div>

      {/* Footer System Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 text-[9px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-6"
      >
          <span>System ID: 884-XJ-09</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full" />
          <span>Secure Connection</span>
          <span className="w-1 h-1 bg-gray-600 rounded-full" />
          <span className="animate-pulse">Awaiting Input...</span>
      </motion.div>

    </motion.div>
  );
};