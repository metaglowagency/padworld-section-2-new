import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, Cpu, Database } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

// --- TTS & Gemini Integration (Self-Contained) ---

// Initialize Gemini safely
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper: Gemini TTS returns raw PCM 16-bit data at 24kHz without headers.
// We must manually decode this to play it in the browser.
async function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const byteLength = data.length;
  const adjLength = byteLength % 2 !== 0 ? byteLength - 1 : byteLength;
  const dataInt16 = new Int16Array(data.buffer, 0, adjLength / 2);

  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const playSystemIntro = async () => {
    const text = "Accessing the world's most advanced ecosystem ever engineered.";
    
    // Fallback if API fails or key is missing
    const playFallback = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 0.7; 
        utterance.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    };

    if (!ai) {
        playFallback();
        return;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        // Fenrir is a deeper, authoritative voice perfect for 'System'
                        prebuiltVoiceConfig: { voiceName: 'Fenrir' }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (base64Audio) {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Resume context if suspended (browser requirement after interaction)
            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }

            const binaryString = window.atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Manual PCM Decoding (Raw data has no headers, so decodeAudioData fails)
            const audioBuffer = await pcmToAudioBuffer(bytes, audioCtx, 24000); 
            
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
        } else {
            playFallback();
        }
    } catch (error) {
        console.error("TTS Error:", error);
        playFallback();
    }
};

// --- Visual Components Data ---

const bootLogStream = [
  "KERNEL_PANIC_CHECK... PASS",
  "LOADING_DRIVER: NEURAL_ENGINE_V9",
  "MOUNTING_VIRTUAL_FS: /dev/padworld_root",
  "ALLOCATING_MEMORY: 128TB [OK]",
  "DECRYPTING_USER_SPACE... [OK]",
  "INITIALIZING_GRAPHICS_SUBSYSTEM...",
  "LOADING_SHADER_CACHE [2048 FILES]",
  "CONNECTING_TO_GLOBAL_MESH...",
  "HANDSHAKE_INIT: NODE_TOKYO [OK]",
  "HANDSHAKE_INIT: NODE_DUBAI [OK]",
  "HANDSHAKE_INIT: NODE_NY [OK]",
  "HANDSHAKE_INIT: NODE_LONDON [OK]",
  "OPTIMIZING_GEOMETRY_PIPELINE...",
  "SYNCING_MARKET_TELEMETRY...",
  "VERIFYING_SECURITY_TOKENS...",
  "ACCESS_CONTROL_LIST_UPDATE...",
  "SYSTEM_INTEGRITY_VERIFIED.",
  "PADWORLD_OS_KERNEL_READY."
];

const AnimatedNumber = () => {
    const [num, setNum] = useState(840);
    useEffect(() => {
        const i = setInterval(() => setNum(Math.floor(Math.random() * 9000)), 100);
        return () => clearInterval(i);
    }, []);
    return <span>{num}</span>;
}

// --- Visual Components ---

const ServerGrid: React.FC = () => {
    return (
        <div className="grid grid-cols-8 gap-2 opacity-80">
            {[...Array(32)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-[1px] bg-gray-800"
                    animate={{
                        backgroundColor: ["#1f2937", "#ACFF01", "#1f2937"],
                        boxShadow: ["0 0 0px #000", "0 0 5px #ACFF01", "0 0 0px #000"]
                    }}
                    transition={{
                        duration: Math.random() * 0.5 + 0.2,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 2,
                        delay: Math.random() * 1
                    }}
                />
            ))}
        </div>
    );
};

const BootLog: React.FC = () => {
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < bootLogStream.length) {
                setLines(prev => [...prev.slice(-8), bootLogStream[currentIndex]]);
                currentIndex++;
            } else {
                currentIndex = 0; // Loop for effect
            }
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-[10px] text-neon-lime/70 leading-relaxed h-32 overflow-hidden flex flex-col justify-end">
            {lines.map((line, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    > {line}
                </motion.div>
            ))}
        </div>
    );
};

const VoiceVisualizer: React.FC = () => {
    return (
        <div className="flex items-center gap-1 h-8">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-white"
                    animate={{
                        height: ["10%", "100%", "10%"],
                        opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: i * 0.02,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

// --- Main Component ---

interface BootSequenceProps {
  onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Trigger the Generative Voice
    playSystemIntro();

    // 2. Run the Progress Bar Logic
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        // Accelerate as it gets closer
        const increment = prev > 80 ? 1 : Math.random() * 3;
        return prev + increment;
      });
    }, 30);

    // 3. Complete the sequence after audio duration (approx 6s)
    const timer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
        key="boot-sequence"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] bg-black text-white font-mono overflow-hidden cursor-none flex flex-col items-center justify-center perspective-1000"
    >
        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 0%, black 100%)" />
            
            {/* Rotating Wireframe Globe Effect */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-[800px] h-[800px] border border-white/20 rounded-full relative"
                >
                    <div className="absolute inset-0 border border-white/10 rounded-full rotate-45 scale-90" />
                    <div className="absolute inset-0 border border-white/10 rounded-full -rotate-45 scale-75" />
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
                    <div className="absolute top-0 left-1/2 w-px h-full bg-white/20" />
                </motion.div>
            </div>
        </div>

        <div className="relative z-10 w-full max-w-6xl px-8 grid grid-cols-1 md:grid-cols-12 gap-12 h-full py-12">
            
            {/* Left Panel: Server Status */}
            <div className="hidden md:flex flex-col justify-center col-span-3 border-r border-white/10 pr-8 space-y-8">
                    <div>
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 font-mono uppercase tracking-widest">
                        <Server className="w-4 h-4 text-neon-lime" /> Server Cluster
                    </div>
                    <ServerGrid />
                    <div className="mt-2 text-[10px] text-gray-600 font-mono">
                        STATUS: <span className="text-neon-lime">OPTIMAL</span>
                    </div>
                    </div>

                    <div>
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 font-mono uppercase tracking-widest">
                        <Cpu className="w-4 h-4 text-neon-blue" /> Neural Cores
                    </div>
                    <div className="flex gap-1">
                            {[...Array(4)].map((_,i) => (
                                <div key={i} className="flex-1 h-1 bg-gray-800 rounded overflow-hidden">
                                    <motion.div 
                                    className="h-full bg-neon-blue"
                                    animate={{ width: ["10%", "90%", "30%"] }}
                                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                                    />
                                </div>
                            ))}
                    </div>
                    </div>
            </div>

            {/* Center Panel: Main Voice & Progress */}
            <div className="col-span-1 md:col-span-6 flex flex-col items-center justify-center text-center">
                
                {/* Voice Visualizer - Acts as the 'Speaker' */}
                <div className="mb-8">
                    <VoiceVisualizer />
                </div>

                {/* The Main Voice Text */}
                <div className="relative mb-12 min-h-[120px] flex items-center justify-center">
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="text-2xl md:text-4xl font-light font-display text-white uppercase leading-snug tracking-wide"
                    >
                        <span className="block text-gray-400 text-sm tracking-[0.5em] mb-4 animate-pulse">SYSTEM ANNOUNCEMENT</span>
                        Accessing the world's most <br/>
                        <motion.span 
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-lime to-white"
                        >
                            advanced ecosystem
                        </motion.span> <br/>
                        ever engineered
                    </motion.h1>
                </div>

                {/* Main Progress Bar */}
                <div className="w-full max-w-md">
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2 uppercase tracking-widest">
                        <span>System Load</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-900 overflow-hidden mb-2 rounded-full">
                        <motion.div 
                            className="h-full bg-white shadow-[0_0_15px_white]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel: Terminal Stream */}
            <div className="hidden md:flex flex-col justify-center col-span-3 border-l border-white/10 pl-8">
                <div className="flex items-center gap-2 mb-4 text-xs text-gray-400 font-mono uppercase tracking-widest">
                    <Activity className="w-4 h-4 text-white" /> Kernel Log
                </div>
                <BootLog />
                
                <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400 font-mono uppercase tracking-widest">
                        <Database className="w-4 h-4 text-gray-500" /> Data Uplink
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono">
                        PACKETS: <AnimatedNumber /> / SEC <br/>
                        ENCRYPTION: AES-256-GCM
                    </div>
                </div>
            </div>

        </div>

        {/* Corner Decor */}
        <div className="absolute bottom-8 left-8 flex items-center gap-2">
            <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse" />
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Secure Connection Established</span>
        </div>

    </motion.div>
  );
};

export default BootSequence;