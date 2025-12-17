import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, Plus, X } from 'lucide-react';
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
    const randomMargin = (Math.random() * 15).toFixed(1); // Slightly larger margin range
    
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
      {/* Subtle Monochrome Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Left Column: Text & Controls */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 bg-white/5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="font-mono text-[10px] text-white tracking-widest uppercase">Var System v2.0</span>
          </div>
          
          <h2 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter mb-6 text-white leading-[0.9]">
            Auto-Referee <br/>
            <span className="text-gray-500">Precision Engine</span>
          </h2>
          
          <p className="text-gray-400 mb-8 font-light leading-relaxed">
            Eliminate arguments forever. Our millimetric precision sensors combine optical tracking with pressure-sensitive floor data to detect lines, bounces, and faults with <span className="text-white font-bold">99.8% accuracy</span>.
          </p>
          
          <div className="p-6 bg-black/50 border border-white/10 rounded-xl backdrop-blur-sm relative overflow-hidden group">
            
            <div className="flex justify-between items-center mb-6 font-mono text-xs text-gray-500 border-b border-white/5 pb-4">
               <span>CASE ID: #882-ALPHA</span>
               <span className={status === 'IDLE' ? 'text-gray-500' : 'text-white animate-pulse'}>
                 {status === 'IDLE' ? 'READY' : status}
               </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300 font-mono">Ball Velocity</span>
                <span className="text-white font-bold font-mono">142 KM/H</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300 font-mono">Impact Angle</span>
                <span className="text-white font-bold font-mono">34.2°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300 font-mono">Compression</span>
                <span className="text-white font-bold font-mono">12mm</span>
              </div>
            </div>

            <div className="mt-8">
              {status === 'IDLE' || status === 'RESULT' ? (
                <Button onClick={status === 'RESULT' ? reset : startReview} className="w-full bg-white text-black hover:bg-gray-200 border-none">
                  {status === 'RESULT' ? <><RefreshCw size={16} /> RESET SIMULATION</> : <><AlertCircle size={16} /> CHALLENGE CALL</>}
                </Button>
              ) : (
                <div className="h-12 w-full bg-white/5 border border-white/10 rounded flex items-center justify-center font-mono text-xs text-white tracking-widest">
                  PROCESSING DATA...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: The Visualizer */}
        <div className="relative aspect-square bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl">
          
          {/* 1. Pure CSS Grid Background (No Images) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
          
          {/* 2. The Court Lines (The Straight "+" Shape) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Vertical Line */}
              <div className="w-2 h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10"></div>
              {/* Horizontal Line */}
              <div className="absolute w-full h-2 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10"></div>
          </div>

          {/* 3. Ball Logic - Tennis Ball Yellow */}
          <motion.div 
            className="absolute top-1/2 left-1/2 w-6 h-6 bg-[#E3F848] rounded-full shadow-[0_0_25px_#E3F848] z-20"
            initial={{ opacity: 0, scale: 4, x: 150, y: -150 }}
            animate={status === 'SCANNING' || status === 'ANALYZING' 
                ? { opacity: 1, scale: 1, x: 0, y: 0 } 
                : { opacity: 0 }
            }
            transition={{ duration: 0.6, ease: "circOut" }}
          />

          {/* Impact Marker (Static White X) */}
          {(status === 'ANALYZING' || status === 'RESULT') && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 z-10 flex items-center justify-center opacity-60">
                 <div className="absolute w-full h-0.5 bg-white rotate-45"></div>
                 <div className="absolute w-full h-0.5 bg-white -rotate-45"></div>
            </div>
          )}

          {/* Impact Ripple (White Ring) */}
          <AnimatePresence>
            {status === 'ANALYZING' && (
                <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white rounded-full z-10"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
          </AnimatePresence>

          {/* Scanning Effect (White Laser) */}
          <AnimatePresence>
            {(status === 'SCANNING' || status === 'ANALYZING') && (
              <motion.div className="absolute inset-0 z-30 pointer-events-none">
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_15px_white]"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="absolute bottom-6 left-6 font-mono text-xs text-black bg-white px-2 py-0.5 font-bold">
                   {status === 'SCANNING' ? 'ACQUIRING...' : 'COMPUTING...'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Overlay */}
          <AnimatePresence>
            {status === 'RESULT' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm"
              >
                <div className="relative">
                    {/* Updated to be straight (non-italic) and white for contrast */}
                    <h3 className="text-9xl font-black tracking-tighter text-white mix-blend-difference mb-4">
                      {result}
                    </h3>
                    {/* Decorative cut line */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-black mix-blend-overlay"></div>
                </div>
                
                <div className="flex gap-8 mt-4 border-t border-white/20 pt-6">
                   <div className="text-center">
                     <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Confidence</div>
                     <div className="text-xl font-bold text-white font-mono">99.9%</div>
                   </div>
                   <div className="w-px bg-white/20"></div>
                   <div className="text-center">
                     <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Margin</div>
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