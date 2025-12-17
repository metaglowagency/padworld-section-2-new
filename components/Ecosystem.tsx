import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, Trophy, ShoppingBag, Zap, Users, Globe, 
  Layout, TrendingUp, Droplet, Coffee, Database, Share2
} from 'lucide-react';

const ecosystemItems = [
  { icon: Layout, label: "Smart Court", colorName: "neon-lime", description: "Hardware Source" },
  { icon: Smartphone, label: "PadChat", colorName: "neon-blue", description: "Social Platform" },
  { icon: TrendingUp, label: "AI Ranking", colorName: "neon-lime", description: "Global Ledger" },
  { icon: Users, label: "PadTeams", colorName: "neon-blue", description: "Team Management" },
  { icon: Zap, label: "FastPad", colorName: "white", description: "Booking Engine" },
  { icon: Droplet, label: "PadWater", colorName: "neon-blue", description: "Nutrition" },
  { icon: ShoppingBag, label: "PadWear", colorName: "white", description: "Merchandise" },
  { icon: Coffee, label: "Pad&Juice", colorName: "neon-lime", description: "Hospitality" },
  { icon: Trophy, label: "Tournaments", colorName: "neon-blue", description: "Competition" },
  { icon: Globe, label: "Franchise", colorName: "white", description: "Global Network" },
];

const getColorClasses = (colorName: string) => {
  switch (colorName) {
    case 'neon-lime': return { text: 'text-neon-lime', border: 'border-neon-lime', bg: 'bg-neon-lime', glow: 'shadow-[0_0_20px_#ACFF01]' };
    case 'neon-blue': return { text: 'text-neon-blue', border: 'border-neon-blue', bg: 'bg-neon-blue', glow: 'shadow-[0_0_20px_#2DD6FF]' };
    default: return { text: 'text-white', border: 'border-white', bg: 'bg-white', glow: 'shadow-[0_0_20px_#FFFFFF]' };
  }
};

export const Ecosystem: React.FC = () => {
  return (
    <section className="py-32 relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-t border-white/5 bg-black">
       {/* Background Ambience */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_80%)] z-0" />
       
       <div className="relative z-10 text-center mb-12 px-6">
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
         >
           <div className="flex items-center justify-center gap-2 mb-6">
              <Share2 className="text-neon-blue" size={14} />
              <span className="font-mono text-[10px] text-neon-blue tracking-[0.3em] uppercase">
                Holistic Architecture
              </span>
           </div>
           
           <h2 className="font-display font-black text-5xl md:text-8xl uppercase tracking-tighter text-white mb-6 leading-[0.9]">
             PadWorld <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-lime to-neon-blue">Universe</span>
           </h2>
         </motion.div>
       </div>

       {/* Solar System Container */}
       <div className="relative w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] flex items-center justify-center z-10 scale-[0.4] sm:scale-[0.5] md:scale-[0.7] lg:scale-[0.8] xl:scale-100 transition-transform duration-700">
          
          {/* Main Orbital Ring */}
          <div className="absolute inset-0 rounded-full border border-white/10 opacity-50" />
          
          {/* Animated Dashed Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-50px] rounded-full border border-white/5 border-dashed"
          />
           <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[150px] rounded-full border border-neon-blue/10 border-dotted"
          />

          {/* Central Core */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="relative z-20 w-48 h-48 bg-black border border-white/20 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(45,214,255,0.15)]"
          >
             {/* Core Animations */}
             <div className="absolute inset-0 rounded-full bg-neon-lime/5 animate-pulse" />
             <div className="absolute -inset-4 rounded-full border border-neon-lime/20 border-dashed animate-[spin_20s_linear_infinite]" />
             
             <Database className="text-neon-blue mb-2" size={40} />
             <div className="font-sans font-black text-3xl text-white tracking-tighter z-10">CORE<span className="text-neon-lime">AI</span></div>
             <div className="font-mono text-[9px] text-gray-500 tracking-[0.2em] mt-2 uppercase">Central Intelligence</div>
          </motion.div>
          
          {/* Orbiting Items */}
          {ecosystemItems.map((item, index) => {
             const count = ecosystemItems.length;
             const angle = (index / count) * 360;
             const radius = 420; // Distance from center
             const colors = getColorClasses(item.colorName);
             
             return (
               <div 
                  key={item.label}
                  className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center"
                  style={{ transform: `rotate(${angle}deg)` }}
               >
                  {/* The Arm/Connector */}
                  <div className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-white/20 to-transparent w-[420px] origin-left" />

                  {/* Data Packet flowing to Core */}
                  <motion.div 
                     className={`absolute top-[-2px] h-[4px] w-[20px] rounded-full ${colors.bg} shadow-[0_0_10px_currentColor]`}
                     style={{ left: 50 }}
                     animate={{ left: [radius - 50, 80], opacity: [0, 1, 0] }}
                     transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: index * 0.3 }}
                  />

                  {/* The Planet Node */}
                  <div 
                    className="absolute"
                    style={{ left: radius, transform: `translate(-50%, -50%) rotate(-${angle}deg)` }}
                  >
                      <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + (index * 0.05) }}
                          className="flex flex-col items-center group cursor-pointer w-40"
                      >
                          {/* Icon Circle */}
                          <div 
                              className={`
                                relative w-16 h-16 rounded-full bg-black border flex items-center justify-center 
                                shadow-lg transition-all duration-500 group-hover:scale-110 z-10
                                ${colors.border} ${colors.glow}
                              `}
                          >
                             <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                             <item.icon className={`${colors.text} transition-transform duration-500 group-hover:rotate-12`} size={24} />
                          </div>
                          
                          {/* Label Box - TEXT IS HERE AND VISIBLE */}
                          <div className="mt-4 text-center">
                              <div className={`font-sans font-bold text-sm uppercase tracking-wider ${colors.text} mb-1 block`}>
                                {item.label}
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">
                                {item.description}
                              </div>
                          </div>
                      </motion.div>
                  </div>
               </div>
             );
          })}
       </div>
    </section>
  );
};