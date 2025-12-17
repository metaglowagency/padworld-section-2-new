import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Pause, Play, Target, Zap, TrendingUp, Hexagon, BarChart3, Database } from 'lucide-react';

const initialPerformanceData = [
  { time: '00', power: 45, speed: 30, stamina: 90 },
  { time: '05', power: 55, speed: 45, stamina: 88 },
  { time: '10', power: 75, speed: 60, stamina: 85 },
  { time: '15', power: 60, speed: 50, stamina: 82 },
  { time: '20', power: 85, speed: 75, stamina: 75 },
  { time: '25', power: 95, speed: 85, stamina: 70 },
  { time: '30', power: 70, speed: 65, stamina: 68 },
  { time: '35', power: 88, speed: 80, stamina: 65 },
  { time: '40', power: 92, speed: 90, stamina: 60 },
  { time: '45', power: 65, speed: 55, stamina: 58 },
];

const skillsData = [
  { subject: 'VELOCITY', A: 120, B: 110, fullMark: 150 },
  { subject: 'PRECISION', A: 98, B: 130, fullMark: 150 },
  { subject: 'AGILITY', A: 86, B: 130, fullMark: 150 },
  { subject: 'STRATEGY', A: 99, B: 140, fullMark: 150 },
  { subject: 'STAMINA', A: 85, B: 120, fullMark: 150 },
  { subject: 'TECHNIQUE', A: 65, B: 100, fullMark: 150 },
];

// Custom Axis Tick for futuristic look
const CustomTick = ({ payload, x, y, textAnchor, stroke, radius }: any) => {
  return (
    <g className="recharts-layer recharts-polar-angle-axis-tick">
      <text
        radius={radius}
        stroke={stroke}
        x={x}
        y={y}
        className="text-[10px] font-mono font-bold fill-neon-blue tracking-widest"
        textAnchor={textAnchor}
      >
        <tspan x={x} dy="0.3em">{payload.value}</tspan>
      </text>
    </g>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-neon-lime p-3 rounded shadow-[0_0_20px_rgba(172,255,1,0.2)]">
        <p className="text-white font-mono text-xs mb-2 border-b border-white/20 pb-1">TIMECODE: {label}m</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-[10px] font-mono uppercase" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC = () => {
  const [data, setData] = useState(initialPerformanceData);
  const [isLive, setIsLive] = useState(true);
  const [heatmapBg, setHeatmapBg] = useState('/analytics_heatmap.jpg');

  // Simulate Live Data Feed
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        if (newData.length > 15) newData.shift();
        const lastItem = newData[newData.length - 1];
        const nextTime = (parseInt(lastItem.time) + 5).toString();
        
        newData.push({
          time: nextTime,
          power: Math.min(100, Math.max(30, lastItem.power + (Math.random() - 0.5) * 40)),
          speed: Math.min(100, Math.max(30, lastItem.speed + (Math.random() - 0.5) * 40)),
          stamina: Math.max(0, lastItem.stamina - Math.random() * 2),
        });
        return newData;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="py-24 max-w-[1400px] mx-auto px-6 relative">
      
      {/* Section Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <Database size={16} className="text-neon-lime" />
             <span className="font-mono text-xs text-neon-lime tracking-widest uppercase">Post-Match Telemetry</span>
          </div>
          <h2 className="font-display font-black text-5xl uppercase tracking-tighter text-white leading-[0.9]">
            Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">Analytics</span>
          </h2>
        </div>
        
        <div className="flex gap-4">
            <div className="text-right hidden md:block">
                <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Data Points</div>
                <div className="text-2xl font-black text-white font-mono">5,249</div>
            </div>
            <button 
            onClick={() => setIsLive(!isLive)}
            className={`h-12 px-6 border rounded-sm font-mono text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${isLive ? 'border-neon-lime text-black bg-neon-lime hover:bg-white' : 'border-white/20 text-white hover:bg-white/10'}`}
            >
            {isLive ? <Pause size={14} /> : <Play size={14} />}
            {isLive ? 'LIVE FEED ACTIVE' : 'RESUME FEED'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
        
        {/* LEFT COLUMN: Main Intensity Graph */}
        <div className="lg:col-span-8 bg-black/40 border border-white/10 backdrop-blur-md rounded-sm p-1 relative group overflow-hidden flex flex-col">
            {/* Decor Header */}
            <div className="h-10 border-b border-white/5 bg-white/5 flex justify-between items-center px-4">
                <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} className="text-neon-blue"/> Kinetic Output
                </span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px] relative p-4">
                 {/* Graph Grid Background */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none"></div>

                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ACFF01" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#ACFF01" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2DD6FF" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#2DD6FF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="time" stroke="#444" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#444" tick={{fill: '#666', fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="power" name="POWER" stroke="#ACFF01" strokeWidth={2} fill="url(#colorPower)" />
                        <Area type="monotone" dataKey="speed" name="SPEED" stroke="#2DD6FF" strokeWidth={2} fill="url(#colorSpeed)" />
                    </AreaChart>
                 </ResponsiveContainer>
            </div>
            
            {/* Stats Row */}
            <div className="h-24 border-t border-white/10 bg-black/20 grid grid-cols-4 divide-x divide-white/10">
                {[
                    { label: "Peak Vel", val: "142", unit: "km/h", col: "text-white" },
                    { label: "Avg Power", val: "890", unit: "watts", col: "text-neon-lime" },
                    { label: "Distance", val: "4.2", unit: "km", col: "text-neon-blue" },
                    { label: "Strain", val: "High", unit: "lvl", col: "text-red-500" },
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col justify-center items-center">
                        <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`font-sans font-black text-2xl ${stat.col}`}>{stat.val}</span>
                            <span className="font-mono text-[10px] text-gray-500">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT COLUMN: Radar + Heatmap */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Radar Chart Card */}
            <div className="flex-1 bg-black/40 border border-white/10 backdrop-blur-md rounded-sm p-1 flex flex-col">
                <div className="h-10 border-b border-white/5 bg-white/5 flex justify-between items-center px-4">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Target size={12} className="text-neon-lime"/> Skill Matrix
                    </span>
                    <div className="text-[9px] font-mono text-neon-blue border border-neon-blue/30 px-1 rounded">PRO COMPARISON</div>
                </div>
                <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillsData}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={(props) => <CustomTick {...props} />} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar name="Pro Avg" dataKey="B" stroke="#444" strokeWidth={1} strokeDasharray="3 3" fill="#888" fillOpacity={0.1} />
                            <Radar name="You" dataKey="A" stroke="#ACFF01" strokeWidth={2} fill="#ACFF01" fillOpacity={0.2} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                    
                    {/* Decorative Corners */}
                    <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-white/30"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-white/30"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-white/30"></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-white/30"></div>
                </div>
            </div>

            {/* Heatmap / Zone Card */}
            <div className="h-48 bg-black/40 border border-white/10 backdrop-blur-md rounded-sm p-4 relative overflow-hidden flex items-center gap-4">
                <div className="flex-1 relative h-full rounded border border-white/5 overflow-hidden">
                     {/* Local Image with Fallback */}
                     <img 
                        src={heatmapBg} 
                        onError={() => setHeatmapBg('https://images.unsplash.com/photo-1554068865-2415f90d23bb?q=80&w=400&auto=format&fit=crop')}
                        className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale"
                        alt="Heatmap Court"
                     />

                     {/* Heatmap Overlay */}
                     <div className="absolute top-[20%] right-[20%] w-16 h-16 bg-red-500/40 blur-xl rounded-full"></div>
                     <div className="absolute bottom-[30%] left-[30%] w-20 h-20 bg-orange-500/30 blur-xl rounded-full"></div>
                     
                     {/* Court Lines SVG */}
                     <svg className="absolute inset-0 w-full h-full stroke-white/30 stroke-1 fill-none z-10">
                        <rect x="10%" y="10%" width="80%" height="80%" />
                        <line x1="50%" y1="10%" x2="50%" y2="90%" />
                        <line x1="10%" y1="50%" x2="90%" y2="50%" />
                     </svg>
                </div>
                <div className="w-1/3 flex flex-col justify-center gap-3">
                    <div>
                        <div className="text-[9px] text-gray-500 font-mono uppercase">Dominant Zone</div>
                        <div className="text-white font-bold text-sm">Net Position</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-gray-500 font-mono uppercase">Heat Intensity</div>
                        <div className="text-red-500 font-bold text-sm">High</div>
                    </div>
                    <div className="mt-2">
                        <div className="text-[9px] text-neon-blue font-mono uppercase border border-neon-blue/30 px-2 py-1 rounded text-center">
                            View Heatmap
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};