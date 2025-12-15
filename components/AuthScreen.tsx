import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Terminal } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState(false);
  const [glitch, setGlitch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.toLowerCase() === 'padworld') {
      onAuthenticated();
    } else {
      setError(true);
      setGlitch(true);
      setTimeout(() => setGlitch(false), 500);
      setPassphrase('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,214,255,0.05)_0%,rgba(0,0,0,1)_70%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 max-w-md w-full ${glitch ? 'animate-pulse' : ''}`}
      >
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 border border-neon-blue/30 rounded-full bg-neon-blue/5">
              <Lock className="w-6 h-6 text-neon-blue" />
            </div>
          </div>
          <h1 className="font-sans font-black text-4xl uppercase tracking-tighter text-white mb-2 leading-none">
            Access Level 02
          </h1>
          <p className="font-mono text-xs text-neon-lime tracking-widest uppercase opacity-80">
            Restricted Area • Investor Clearance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-lime opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
            <div className="relative bg-carbon border border-white/10 p-1 flex items-center">
              <div className="pl-4 pr-2 text-gray-500">
                <Terminal size={16} />
              </div>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setError(false);
                }}
                className="w-full bg-transparent border-none focus:ring-0 text-white font-mono tracking-widest py-3 px-2 placeholder-gray-700 uppercase outline-none"
                placeholder="ENTER PASSPHRASE"
                autoFocus
              />
              <button 
                type="submit"
                className="p-3 bg-white/5 hover:bg-neon-lime hover:text-black text-white transition-colors duration-200"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="h-6 text-center">
            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-500 font-mono text-xs uppercase tracking-widest"
              >
                Access Denied: Invalid Credentials
              </motion.p>
            )}
            {!error && (
              <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest">
                Hint: The name of the ecosystem
              </p>
            )}
          </div>
        </form>
      </motion.div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="font-mono text-[10px] text-gray-800 uppercase tracking-[0.3em]">
          Secure Connection // PadWorld Industries
        </p>
      </div>
    </div>
  );
};