import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, XCircle, AlertCircle, RefreshCw, ZoomIn } from 'lucide-react';
import { Button } from './ui/Button';

interface AutoRefereeProps {
  demoMode?: boolean;
}

export const AutoReferee: React.FC<AutoRefereeProps> = ({ demoMode = false }) => {
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'ANALYZING' | 'RESULT'>('IDLE');
  const [result, setResult] = useState<'IN' | 'OUT'>('IN');
  const [margin, setMargin] = useState(0);

  const startReview = () => {
    setStatus('SCANNING');
    
    // Randomize result for demo purposes
    const isIn = Math.random() > 0.4; // 60% chance of IN
    const randomMargin = (Math.random() * 5).toFixed(1);
    
    setTimeout(() => setStatus('ANALYZING'), 2000);
    setTimeout(() => {
      setResult(isIn ? 'IN' : 'OUT');
      setMargin(Number(randomMargin));
      setStatus('RESULT');
    }, 4500);
  };

  const reset = () => {
    setStatus('IDLE');
  };

  // Demo Mode Trigger
  useEffect(() => {
    if (demoMode && status === 'IDLE') {
        const timeout = setTimeout(() => {
            startReview();
        }, 1000);
        return () => clearTimeout(timeout);
    }
  }, [demoMode]);

  return (
    <div className="py-24 bg-carbon border-y border-white/5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-lime/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Left Column: Text & Controls */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-blue/30 bg-neon-blue/5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse" />
            <span className="font-mono text-[10px] text-neon-blue tracking-widest uppercase">Var System v2.0</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white leading-[0.9]">
            Auto-Referee <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Precision Engine</span>
          </h2>
          
          <p className="text-gray-400 mb-8 font-light leading-relaxed">
            Eliminate arguments forever. Our millimetric precision sensors combine optical tracking with pressure-sensitive floor data to detect lines, bounces, and faults with <span className="text-white font-bold">99.8% accuracy</span>.
          </p>
          
          <div className="p-6 bg-black/50 border border-white/10 rounded-xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-lime/0 via-neon-lime/5 to-neon-lime/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex justify-between items-center mb-6 font-mono text-xs text-gray-500 border-b border-white/5 pb-4">
               <span>CASE ID: #882-ALPHA</span>
               <span className={status === 'IDLE' ? 'text-gray-500' : 'text-neon-lime animate-pulse'}>
                 {status === 'IDLE' ? 'READY' : status}
               </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300 font-mono">Ball Velocity</span>
                <span className="text-neon-blue font-bold font-mono">142 KM/H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300 font-mono">Impact Angle</span>
                <span className="text-neon-blue font-bold font-mono">34.2°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300 font-mono">Compression</span>
                <span className="text-neon-blue font-bold font-mono">12mm</span>
              </div>
            </div>

            <div className="mt-8">
              {status === 'IDLE' || status === 'RESULT' ? (
                <Button onClick={status === 'RESULT' ? reset : startReview} className="w-full">
                  {status === 'RESULT' ? <><RefreshCw size={16} /> RESET SIMULATION</> : <><AlertCircle size={16} /> CHALLENGE CALL</>}
                </Button>
              ) : (
                <div className="h-12 w-full bg-white/5 border border-white/10 rounded flex items-center justify-center font-mono text-xs text-neon-lime tracking-widest">
                  PROCESSING DATA...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: The Visualizer */}
        <div className="relative aspect-square bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {/* Base Image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626245358985-cc488b03046f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          {/* Court Line */}
          <div className="absolute top-0 bottom-0 left-[60%] w-2 bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.5)]" />

          {/* Ball Graphic (CSS) */}
          <motion.div 
            className="absolute top-[45%] left-[56%] w-12 h-12 bg-yellow-300 rounded-full shadow-[0_0_20px_rgba(253,224,71,0.6)] z-10"
            initial={{ scale: 1 }}
            animate={status === 'SCANNING' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
             {/* Impact Ripple */}
             {status === 'SCANNING' && (
               <div className="absolute inset-0 border-2 border-neon-lime rounded-full animate-ping opacity-50" />
             )}
          </motion.div>

          {/* Scanning Overlay */}
          <AnimatePresence>
            {(status === 'SCANNING' || status === 'ANALYZING') && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 pointer-events-none"
              >
                {/* Scan Line */}
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-1 bg-neon-lime shadow-[0_0_20px_#ACFF01]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                />
                
                {/* Magnification Box */}
                <motion.div 
                  className="absolute top-[35%] left-[45%] w-[30%] h-[30%] border-2 border-neon-blue bg-neon-blue/10 backdrop-blur-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                   <div className="absolute top-0 left-0 p-1 bg-neon-blue text-black text-[8px] font-mono font-bold">ROI: IMPACT</div>
                   <div className="absolute bottom-2 right-2 text-neon-blue text-[10px] font-mono">{status === 'SCANNING' ? 'ACQUIRING...' : 'COMPUTING...'}</div>
                   
                   {/* Crosshair */}
                   <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-neon-blue/50" />
                   <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-neon-blue/50" />
                </motion.div>

                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(45,214,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(45,214,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Overlay */}
          <AnimatePresence>
            {status === 'RESULT' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring" }}
                  className={`w-40 h-40 rounded-full border-4 ${result === 'IN' ? 'border-neon-lime' : 'border-red-500'} flex items-center justify-center mb-6 bg-black relative`}
                >
                   <div className={`absolute inset-0 rounded-full ${result === 'IN' ? 'bg-neon-lime/10' : 'bg-red-500/10'} animate-pulse`} />
                   {result === 'IN' ? <CheckCircle size={64} className="text-neon-lime" /> : <XCircle size={64} className="text-red-500" />}
                </motion.div>
                
                <h3 className={`text-6xl font-black italic tracking-tighter ${result === 'IN' ? 'text-neon-lime' : 'text-red-500'}`}>
                  {result}
                </h3>
                
                <div className="mt-4 flex gap-8 text-center">
                   <div>
                     <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Confidence</div>
                     <div className="text-xl font-bold text-white font-mono">99.9%</div>
                   </div>
                   <div>
                     <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Distance</div>
                     <div className="text-xl font-bold text-white font-mono">{margin}mm</div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};