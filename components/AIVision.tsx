import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { Scan, Upload, Loader2, Camera, StopCircle, Aperture, Activity, Target, Zap, Layers, Maximize, FileJson, Gauge, Eye, Play, Pause, ChevronRight, Image as ImageIcon, BarChart } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

// --- CONFIGURATION & MOCK DATA ---
const SCENARIOS = [
  {
    id: 'smash',
    label: 'Overhead Smash',
    localImage: '/vision_scenario_1_smash.jpg',
    remoteImage: 'https://images.unsplash.com/photo-1626245358985-cc488b03046f?q=80&w=1200&auto=format&fit=crop',
    mock: {
      logs: ["ACTION: OVERHEAD_SMASH", "CONTACT_POINT: HIGH", "POWER_TRANSFER: OPTIMAL"],
      metrics: [
        { label: "Ball Speed", value: "165", unit: "km/h", trend: "up" },
        { label: "Vertical Leap", value: "42", unit: "cm", trend: "up" },
        { label: "Impact Force", value: "1200", unit: "N", trend: "stable" }
      ],
      tactical: "Aggressive court positioning detected. High probability of winner down the line."
    }
  },
  {
    id: 'volley',
    label: 'Net Volley',
    localImage: '/vision_scenario_2_volley.jpg',
    remoteImage: 'https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=1200&auto=format&fit=crop', // Padel/Tennis Net action
    mock: {
      logs: ["ACTION: FOREHAND_VOLLEY", "GRIP: CONTINENTAL", "STANCE: SPLIT_STEP"],
      metrics: [
        { label: "Reaction Time", value: "0.24", unit: "s", trend: "down" },
        { label: "Racket Angle", value: "115", unit: "deg", trend: "stable" },
        { label: "Net Clearance", value: "15", unit: "cm", trend: "down" }
      ],
      tactical: "Good defensive block. Player is controlling the T-zone effectively."
    }
  },
  {
    id: 'serve',
    label: 'Service Motion',
    localImage: '/vision_scenario_3_serve.jpg',
    remoteImage: 'https://images.unsplash.com/photo-1530915512336-f439ca9959dc?q=80&w=1200&auto=format&fit=crop', // Serve
    mock: {
      logs: ["ACTION: SERVICE_PHASE", "TOSS: CONSISTENT", "LEG_DRIVE: LOADING"],
      metrics: [
        { label: "Toss Height", value: "1.8", unit: "m", trend: "stable" },
        { label: "Shoulder Rot", value: "85", unit: "deg", trend: "up" },
        { label: "Potential Vel", value: "180", unit: "km/h", trend: "up" }
      ],
      tactical: "Kinetic chain loading is efficient. Expect flat serve to the T."
    }
  }
];

interface VisionMetric {
  label: string;
  value: string;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

interface AIAnalysisResult {
  logs: string[];
  metrics: VisionMetric[];
  tactical: string;
}

export const AIVision: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [mode, setMode] = useState<'SCENARIO' | 'CAMERA' | 'UPLOAD'>('SCENARIO');
  const [visionMode, setVisionMode] = useState<'RGB' | 'THERMAL' | 'SKELETON'>('RGB');
  
  // Initialize with the local image of the first scenario
  const [mediaUrl, setMediaUrl] = useState(SCENARIOS[0].localImage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisResult | null>(null);
  
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Load initial mock data for the first scenario to show "instant" value
  useEffect(() => {
    if (mode === 'SCENARIO') {
        setAnalysisData(SCENARIOS[activeScenarioIdx].mock as any);
    }
  }, []);

  // Handle Scenario Change
  const selectScenario = (idx: number) => {
      setActiveScenarioIdx(idx);
      setMode('SCENARIO');
      
      // Try local image first
      setMediaUrl(SCENARIOS[idx].localImage);
      
      // Reset analysis to null briefly to simulate "loading" new data or just set it
      setAnalysisData(null); 
      setTimeout(() => {
          setAnalysisData(SCENARIOS[idx].mock as any);
      }, 500); // Small delay for effect
      stopCamera();
  };

  // --- CAMERA ---
  const startCamera = async () => {
    try {
      setMode('CAMERA');
      setAnalysisData(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
      setCameraStream(stream);
      setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
      }, 100);
    } catch (err) {
      console.error("Camera access denied", err);
      // Fallback
      setMode('SCENARIO'); // Revert to scenario to avoid blue screen
      setAnalysisData({
          logs: ["ERROR: CAMERA_OFFLINE", "CHECK_PERMISSIONS", "USING_SIMULATION"],
          metrics: [],
          tactical: "Unable to access optical sensors."
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleImageError = () => {
      // If the current mediaUrl is the local one, switch to remote
      const currentScenario = SCENARIOS[activeScenarioIdx];
      if (mediaUrl === currentScenario.localImage) {
          setMediaUrl(currentScenario.remoteImage);
      } else {
          // If remote fails, fallback to a safe default
          setMediaUrl('https://images.unsplash.com/photo-1554068865-2415f90d23bb?q=80&w=1200&auto=format&fit=crop');
      }
  };

  // --- CANVAS ANIMATION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize
    const resizeObserver = new ResizeObserver(() => {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
    });
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    let frame = 0;
    let scanY = 0;

    const render = () => {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Grid Overlay (Global)
        if (visionMode !== 'RGB') {
            ctx.strokeStyle = visionMode === 'THERMAL' ? 'rgba(255, 100, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)';
            ctx.lineWidth = 1;
            const gridSize = 50;
            const offset = (frame * 0.5) % gridSize;
            for (let x = offset; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
        }

        // 2. Scan Line (Active Analysis or just ambient)
        scanY = (scanY + 2) % canvas.height;
        const gradient = ctx.createLinearGradient(0, scanY, 0, scanY + 20);
        const color = visionMode === 'THERMAL' ? '255,100,0' : '172,255,1';
        gradient.addColorStop(0, `rgba(${color}, 0)`);
        gradient.addColorStop(0.5, `rgba(${color}, 0.5)`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanY, canvas.width, 20);

        // 3. Simulated Detection Boxes (Face/Body)
        // Draw static-ish boxes that move slightly to simulate tracking on the static image
        const time = Date.now() / 1000;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        // Main Target Box
        const boxSize = 200;
        const xOffset = Math.sin(time) * 20;
        const yOffset = Math.cos(time * 1.5) * 20;
        
        ctx.strokeStyle = `rgba(${color}, 0.8)`;
        ctx.lineWidth = 2;
        
        // Brackets
        const l = 20;
        const x = cx - boxSize/2 + xOffset;
        const y = cy - boxSize/2 + yOffset;
        
        ctx.beginPath();
        ctx.moveTo(x, y + l); ctx.lineTo(x, y); ctx.lineTo(x + l, y); // TL
        ctx.moveTo(x + boxSize - l, y); ctx.lineTo(x + boxSize, y); ctx.lineTo(x + boxSize, y + l); // TR
        ctx.moveTo(x + boxSize, y + boxSize - l); ctx.lineTo(x + boxSize, y + boxSize); ctx.lineTo(x + boxSize - l, y + boxSize); // BR
        ctx.moveTo(x + l, y + boxSize); ctx.lineTo(x, y + boxSize); ctx.lineTo(x, y + boxSize - l); // BL
        ctx.stroke();

        // Label
        ctx.fillStyle = `rgba(${color}, 1)`;
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText(`ID_TRACKING [${(0.95 + Math.random()*0.04).toFixed(2)}]`, x, y - 10);
        
        // Skeleton Nodes (Simulated)
        if (visionMode === 'SKELETON') {
             const joints = [
                 {x: cx, y: cy - 80}, // Head
                 {x: cx, y: cy - 20}, // Neck
                 {x: cx - 40, y: cy}, // L Shoulder
                 {x: cx + 40, y: cy}, // R Shoulder
                 {x: cx - 60, y: cy + 60}, // L Elbow
                 {x: cx + 60, y: cy + 50}, // R Elbow
             ];
             ctx.fillStyle = '#ACFF01';
             joints.forEach(j => {
                 ctx.beginPath();
                 ctx.arc(j.x + xOffset, j.y + yOffset, 3, 0, Math.PI * 2);
                 ctx.fill();
             });
        }

        animationFrameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [visionMode, mode]);

  // --- API HANDLER ---
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisData(null); // Clear previous

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let base64Content = '';
        let mimeType = 'image/jpeg';

        if (mode === 'CAMERA' && videoRef.current) {
            // Capture Camera
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                base64Content = canvas.toDataURL('image/jpeg').split(',')[1];
            }
        } else {
            // Fetch Image (Scenario or Upload)
            const response = await fetch(mediaUrl);
            const blob = await response.blob();
            mimeType = blob.type;
            const reader = new FileReader();
            const dataUrl = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            base64Content = dataUrl.split(',')[1];
        }

        const prompt = `
            Analyze this sports image (Padel/Tennis context).
            Return a valid JSON object with:
            1. "logs": Array of 3 short technical observation strings (e.g. "DETECTED: FOREHAND_DRIVE").
            2. "metrics": Array of 3 objects with "label", "value" (number/string), "unit", and "trend" ('up'|'down'|'stable').
            3. "tactical": A 1-sentence tactical insight about the player's form or position.
        `;

        const modelResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Content } },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: 'application/json' }
        });

        const jsonText = modelResponse.text;
        if (jsonText) {
            setAnalysisData(JSON.parse(jsonText));
        } else {
            throw new Error("Empty response");
        }

    } catch (e) {
        console.warn("API Analysis failed or key missing, falling back to mock.", e);
        // Robust Fallback to Mock Data so presentation doesn't break
        if (mode === 'SCENARIO') {
            setAnalysisData(SCENARIOS[activeScenarioIdx].mock as any);
        } else {
            setAnalysisData({
                logs: ["ANALYSIS: SIMULATED", "CONNECTION: OFFLINE", "MODE: DEMO"],
                metrics: [
                    { label: "Est. Velocity", value: "120", unit: "km/h", trend: "up" },
                    { label: "Confidence", value: "85", unit: "%", trend: "stable" },
                    { label: "Form Score", value: "8.5", unit: "/10", trend: "up" }
                ],
                tactical: "Offline analysis indicates strong player positioning."
            });
        }
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (mode === 'CAMERA') stopCamera();
          setMode('UPLOAD');
          setMediaUrl(URL.createObjectURL(file));
          setAnalysisData(null);
      }
  };

  return (
    <div className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
      {/* Background Tech Elements */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-neon-blue/5 to-transparent skew-x-12 pointer-events-none"></div>
      <div className="absolute top-20 left-20 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT PANEL: Control & Data */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div>
              <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-neon-blue/10 border border-neon-blue rounded">
                    <Scan size={16} className="text-neon-blue" />
                  </div>
                  <span className="font-mono text-xs text-neon-blue tracking-widest uppercase">Pad Vision V2.5</span>
              </div>
              <h2 className="font-display font-black text-4xl md:text-5xl text-white uppercase tracking-tighter leading-[0.9]">
                Visual <br/><span className="text-gray-500">Intelligence</span>
              </h2>
              <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">
                      * Demo Preview Only. Not Final Product.
                  </div>
              </div>
           </div>

           {/* Scenario Selector */}
           <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
               <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Select Scenario</div>
               <div className="grid grid-cols-3 gap-2">
                   {SCENARIOS.map((s, i) => (
                       <button 
                         key={s.id}
                         onClick={() => selectScenario(i)}
                         className={`relative aspect-square rounded overflow-hidden border transition-all ${activeScenarioIdx === i && mode === 'SCENARIO' ? 'border-neon-blue ring-1 ring-neon-blue' : 'border-white/10 hover:border-white/30'}`}
                       >
                           {/* Use remoteImage for the thumbnail as it's guaranteed to exist, or fallbacks handled by img tag */}
                           <img 
                                src={s.remoteImage} 
                                className="absolute inset-0 w-full h-full object-cover" 
                                alt={s.label}
                           />
                           <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                               <span className="text-[8px] font-bold text-white uppercase leading-tight">{s.label}</span>
                           </div>
                       </button>
                   ))}
               </div>
           </div>

           {/* Analysis Output Log */}
           <div className="bg-black border border-white/10 rounded-xl p-4 font-mono text-xs flex-1 min-h-[250px] relative overflow-hidden shadow-inner flex flex-col">
               <div className="absolute top-0 left-0 right-0 h-1 bg-neon-blue/50"></div>
               <div className="flex-1 space-y-3 relative z-10 overflow-y-auto custom-scrollbar">
                   <div className="text-gray-500 pb-2 border-b border-white/5 mb-2">
                       > SYSTEM_READY
                       <br/>
                       > LINKED: GEMINI-2.5-FLASH
                   </div>
                   
                   {isAnalyzing ? (
                       <div className="text-neon-lime animate-pulse flex items-center gap-2 mt-4">
                           <Loader2 size={12} className="animate-spin" /> RUNNING INFERENCE...
                       </div>
                   ) : analysisData ? (
                       <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                           {/* Logs */}
                           <div className="space-y-1">
                               {analysisData.logs.map((log, i) => (
                                   <div key={i} className="text-white flex gap-2">
                                       <span className="text-neon-blue">[{['DET', 'TRK', 'BIO'][i] || 'INF'}]</span> {log}
                                   </div>
                               ))}
                           </div>
                           
                           {/* Tactical Insight */}
                           <div className="bg-white/5 border border-white/10 p-2 rounded">
                               <div className="text-[9px] text-gray-400 uppercase mb-1">AI Coach Insight</div>
                               <div className="text-gray-200 italic leading-relaxed">
                                   "{analysisData.tactical}"
                               </div>
                           </div>
                       </div>
                   ) : (
                       <div className="text-gray-600 mt-4">
                           Waiting for analysis trigger...
                       </div>
                   )}
               </div>
               
               {/* Background Scanline */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
           </div>
        </div>

        {/* RIGHT PANEL: MAIN FEED & CONTROLS */}
        <div className="lg:col-span-8 flex flex-col gap-4">
           
           {/* Visual Feed */}
           <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
               
               {mode === 'CAMERA' ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover scale-x-[-1] transition-all duration-500 ${visionMode === 'THERMAL' ? 'hue-rotate-180 invert contrast-125' : ''}`}
                  />
               ) : (
                  <img 
                    src={mediaUrl} 
                    onError={handleImageError}
                    className={`w-full h-full object-cover transition-all duration-500 ${visionMode === 'THERMAL' ? 'hue-rotate-180 invert contrast-125 saturate-200' : ''}`}
                    alt="Analysis Target" 
                  />
               )}

               {/* Canvas Overlay */}
               <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

               {/* CSS Overlay Elements */}
               <div className="absolute inset-0 pointer-events-none z-20">
                   {/* Corners */}
                   <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-neon-blue opacity-50"></div>
                   <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-neon-blue opacity-50"></div>
                   
                   {/* Metrics HUD (Floating) */}
                   {analysisData && !isAnalyzing && (
                       <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
                           {analysisData.metrics.map((m, i) => (
                               <motion.div 
                                   key={i}
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: i * 0.1 }}
                                   className="bg-black/80 backdrop-blur border-r-2 border-neon-lime p-3 text-right w-40"
                               >
                                   <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mb-1">{m.label}</div>
                                   <div className="flex items-baseline justify-end gap-1">
                                       <span className="text-xl font-black text-white">{m.value}</span>
                                       <span className="text-[10px] text-neon-blue">{m.unit}</span>
                                   </div>
                               </motion.div>
                           ))}
                       </div>
                   )}
               </div>
           </div>

           {/* Controls Bar */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               
               {/* Vision Mode Toggle */}
               <div className="col-span-2 flex gap-1 bg-white/5 border border-white/10 rounded p-1">
                   {['RGB', 'THERMAL', 'SKELETON'].map((v) => (
                       <button 
                           key={v}
                           onClick={() => setVisionMode(v as any)}
                           className={`flex-1 text-[9px] font-bold rounded flex items-center justify-center gap-2 py-2 transition-all ${visionMode === v ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                       >
                           {v === 'RGB' && <Eye size={12} />}
                           {v === 'THERMAL' && <Layers size={12} />}
                           {v === 'SKELETON' && <Activity size={12} />}
                           {v}
                       </button>
                   ))}
               </div>

               {/* External Input */}
               <div className="col-span-2 flex gap-2">
                   <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 text-white rounded hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest transition-colors"
                   >
                      <Upload size={14} /> Upload
                   </button>
                   <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />

                   {/* Analyze Button */}
                   <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-neon-blue text-black border border-neon-blue rounded hover:bg-white hover:border-white font-bold uppercase text-[10px] tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(45,214,255,0.3)]"
                   >
                      {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Aperture size={14} />}
                      {isAnalyzing ? 'Scanning...' : 'Analyze Frame'}
                   </button>
               </div>
               
               {/* Hidden / Developer Camera Toggle (Kept for functionality but de-emphasized) */}
               <button 
                  onClick={mode === 'CAMERA' ? stopCamera : startCamera}
                  className="col-span-4 flex items-center justify-center gap-2 py-2 text-gray-600 hover:text-gray-400 text-[9px] font-mono uppercase tracking-widest transition-colors"
               >
                  {mode === 'CAMERA' ? <StopCircle size={10} /> : <Camera size={10} />}
                  {mode === 'CAMERA' ? 'Stop Live Feed' : 'Access Live Camera Feed (Dev Mode)'}
               </button>

           </div>
        </div>

      </div>
    </div>
  );
};
