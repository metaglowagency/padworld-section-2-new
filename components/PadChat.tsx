import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { 
  Smartphone, Zap, Trophy, Activity, 
  Coins, PlayCircle, Radio, ChevronRight, TrendingUp, ShieldCheck,
  Search, Bell, MoreHorizontal, Share2, Filter, Sparkles, MapPin, CheckCircle2, MessageSquare, BrainCircuit, Send,
  ScanFace, Aperture, Fingerprint, Globe, Gamepad2, Wallet, AudioWaveform, Mic, X, Signal, Target, Crown, Calendar, Clock, BarChart3, Video, ArrowUp, ArrowDown, Minus, Hexagon, ChevronDown, CreditCard,
  Maximize, Layers, Wind, Flame, Wifi, Battery, Radar, RotateCcw, ChevronUp, User
} from 'lucide-react';

// Real image assets for high fidelity simulation
const ASSETS = {
  avatars: {
    me: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    opponent: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    rank1: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
    rank2: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    rank3: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    rank4: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    rank5: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    rank6: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    rank7: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
    rank8: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rank9: "https://images.unsplash.com/photo-1521119989659-a83eee488058?q=80&w=200&auto=format&fit=crop",
    rank10: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
  },
  games: {
    turbo: "https://images.unsplash.com/photo-1530915512336-f439ca9959dc?q=80&w=800&auto=format&fit=crop",
    king: "https://images.unsplash.com/photo-1626245358985-cc488b03046f?q=80&w=800&auto=format&fit=crop",
    drills: "https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=800&auto=format&fit=crop",
    analysis: "https://images.unsplash.com/photo-1530915512336-f439ca9959dc?q=80&w=800&auto=format&fit=crop" // Tennis player serving/overhead
  },
  coach: {
    bg: "https://images.unsplash.com/photo-1622163642998-1ea36746b6b7?q=80&w=800&auto=format&fit=crop"
  }
};

const PLAYER_NAMES: Record<number, string> = {
    4: "Sarah_J",
    5: "Mike.Pro",
    6: "Elena_Tennis",
    7: "David_V",
    8: "K.Yamamoto",
    9: "Lucas_Bravo",
    10: "Sophie.M"
};

const features = [
  { 
    id: 'ranking',
    icon: Globe,
    title: 'Global Ranking',
    desc: 'Democratizing the sport. Earn points locally, rise globally. The first truly meritocratic world tour.',
    color: 'text-neon-blue',
    bg: 'bg-neon-blue',
    screen: 'RANKING'
  },
  { 
    id: 'fastpad', 
    icon: Zap, 
    title: 'FastPad Booking', 
    desc: 'Instant court reservations with split payments. Unlock court doors automatically with your phone.',
    color: 'text-white', 
    bg: 'bg-white',
    screen: 'BOOKING'
  },
  {
    id: 'analyzer',
    icon: Activity,
    title: 'Pro Analyzer',
    desc: 'Deep learning analysis of your technique. Compare your swing signature against top pros.',
    color: 'text-neon-lime',
    bg: 'bg-neon-lime',
    screen: 'ANALYZER'
  },
  { 
    id: 'chat', 
    icon: MessageSquare, 
    title: 'Paddy Chat', 
    desc: 'Text-based tactical advice from Paddy, your personal AI coach trained on your play style.',
    color: 'text-neon-lime', 
    bg: 'bg-neon-lime',
    screen: 'CHAT'
  },
  { 
    id: 'voice', 
    icon: Mic, 
    title: 'Paddy Voice', 
    desc: 'Hands-free ecosystem assistant. "Hey Paddy, book a court" or "Analyze my last set."',
    color: 'text-white', 
    bg: 'bg-white',
    screen: 'VOICE'
  },
  { 
    id: 'passport',
    icon: Fingerprint,
    title: 'Global Passport',
    desc: 'Universal player identity. Verified stats, NFT trophy cabinet, and on-chain match history.',
    color: 'text-purple-400',
    bg: 'bg-purple-400',
    screen: 'PASSPORT'
  },
  { 
    id: 'wallet', 
    icon: Wallet, 
    title: 'PadWallet', 
    desc: 'Manage PAD tokens, pay for court time, and collect NFT trophies for tournament wins.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400',
    screen: 'WALLET'
  },
    { 
    id: 'match', 
    icon: ScanFace, 
    title: 'AI Matchmaking', 
    desc: 'Geo-location based opponent finding. Filters by skill level (NTRP), play style, and availability.',
    color: 'text-neon-blue', 
    bg: 'bg-neon-blue',
    screen: 'MATCH'
  }
];

// Master Prompt for the Persona
const PADDY_SYSTEM_INSTRUCTION = `
You are Paddy, the advanced AI operating system for PadWorld.
Your personality is professional, elite, yet encouraging—like a high-performance sports coach mixed with a futuristic digital assistant.

You have comprehensive knowledge of the PadWorld App features:

1. GLOBAL RANKING: A meritocratic system where players earn points locally to rise globally.
2. FASTPAD BOOKING: Instant reservations with split payments and automated door unlocking via phone.
3. PRO ANALYZER: Deep learning technique analysis comparing player swing signatures against top pros.
4. PADDY CHAT: Your text-based tactical interface for personalized coaching advice.
5. PADDY VOICE: Hands-free assistant for booking courts ("Hey Paddy, book a court") or analyzing stats ("Analyze my last set").
6. GLOBAL PASSPORT: Universal identity with verified stats, NFT trophy cabinet, and on-chain history.
7. PADWALLET: Management of PAD tokens for payments and tournament winnings.
8. AI MATCHMAKING: Geo-location based opponent finding filtered by skill level (NTRP) and style.

Speak concisely. Avoid long monologues.
When analyzing shots, be technical but accessible.
Always maintain the persona of a high-tech system.
`;

// --- AUDIO HELPERS FOR LIVE API ---
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

// Reusable Components
const StarBadge = () => (
  <div className="w-4 h-4 bg-neon-lime rounded-full flex items-center justify-center shadow-[0_0_5px_#ACFF01]">
    <Sparkles size={8} className="text-black" fill="currentColor" />
  </div>
);

const StatusBar = () => (
  <div className="absolute top-0 left-0 right-0 h-12 px-6 pt-3 flex justify-between items-start z-[60] text-white pointer-events-none">
     <div className="w-1/3 flex justify-start">
         <span className="font-sans font-semibold text-[13px] tracking-tight ml-2">9:41</span>
     </div>
     <div className="w-1/3 flex justify-center"></div>
     <div className="w-1/3 flex justify-end items-center gap-1.5 mr-1">
         <Signal size={14} fill="currentColor" strokeWidth={0} className="text-white"/>
         <Wifi size={16} strokeWidth={2.5} className="text-white"/>
         <div className="relative">
             <Battery size={20} className="text-white/40" strokeWidth={1.5} />
             <div className="absolute top-1/2 left-[2.5px] -translate-y-1/2 w-2.5 h-[7px] bg-white rounded-[1px]"></div>
         </div>
     </div>
  </div>
);

// Simulated Wallet Data
const walletData = [
    { v: 4500 }, { v: 4600 }, { v: 4550 }, { v: 4800 }, { v: 4750 }, { v: 4900 }, { v: 4850 }, { v: 5100 }, { v: 5000 }, { v: 5200 }, { v: 5150 }, { v: 5400 }, { v: 5300 }, { v: 5600 }, { v: 5500 }, { v: 5800 }, { v: 6000 }, { v: 5900 }, { v: 6200 }, { v: 6500 }
];

// Analyzer Mock Data
const analyzerBarData = [
  { name: 'Velocity', val: 85, fill: '#ACFF01' },
  { name: 'Spin', val: 92, fill: '#2DD6FF' },
  { name: 'Angle', val: 78, fill: '#FFFFFF' },
];

interface PadChatProps {
  forcedFeatureIndex?: number | null;
}

export const PadChat: React.FC<PadChatProps> = ({ forcedFeatureIndex = null }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  // Feature specific states
  const [analyzerTab, setAnalyzerTab] = useState<'BIO' | 'TRAJ' | 'HEAT'>('BIO');
  const [showProComparison, setShowProComparison] = useState(false);
  const [matchState, setMatchState] = useState<'SCANNING' | 'FOUND'>('SCANNING');
  const [bookingStep, setBookingStep] = useState<'SELECT' | 'CONFIRMING' | 'CONFIRMED'>('SELECT');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [bookingImage, setBookingImage] = useState('/app_court.jpg');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([
      { role: 'model', text: "Systems Online. I am Paddy. How can I optimize your game?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Live API State
  const [liveState, setLiveState] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const closeSessionRef = useRef<(() => void) | null>(null);

  const currentFeature = features[activeFeature];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Handle Forced Feature from Parent Tour + AUTOMATED DEMO SEQUENCES
  useEffect(() => {
      if (forcedFeatureIndex !== null && forcedFeatureIndex >= 0 && forcedFeatureIndex < features.length) {
          setActiveFeature(forcedFeatureIndex);
          setProgress(0); // Reset progress when forced

          const featureId = features[forcedFeatureIndex].id;
          
          // === DEMO: CHAT SEQUENCE ===
          if (featureId === 'chat') {
             setChatHistory([{ role: 'model', text: "Systems Online. I am Paddy. How can I optimize your game?" }]);
             const demoText = "Analyze my last match performance.";
             let i = 0;
             setChatInput('');
             
             // Type Text
             const typeInterval = setInterval(() => {
                 setChatInput(demoText.substring(0, i + 1));
                 i++;
                 if (i === demoText.length) {
                     clearInterval(typeInterval);
                     // Send
                     setTimeout(() => {
                         handleSendChat(demoText);
                     }, 500);
                 }
             }, 50);
             return () => clearInterval(typeInterval);
          }

          // === DEMO: BOOKING SEQUENCE ===
          if (featureId === 'fastpad') {
              setBookingStep('SELECT');
              setSelectedSlot(null);
              // Select a slot after 1.5s
              const t1 = setTimeout(() => setSelectedSlot(4), 1500); // 15:00 slot
              // Click Confirm after 3s
              const t2 = setTimeout(() => setBookingStep('CONFIRMING'), 3000);
              const t3 = setTimeout(() => setBookingStep('CONFIRMED'), 4500);
              return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
          }

          // === DEMO: ANALYZER SEQUENCE ===
          if (featureId === 'analyzer') {
              setAnalyzerTab('BIO');
              setShowProComparison(false);
              const t1 = setTimeout(() => setAnalyzerTab('TRAJ'), 2000);
              const t2 = setTimeout(() => setShowProComparison(true), 4000);
              return () => { clearTimeout(t1); clearTimeout(t2); };
          }

          // === DEMO: MATCHMAKING SEQUENCE ===
          if (featureId === 'match') {
              setMatchState('SCANNING');
              const t1 = setTimeout(() => setMatchState('FOUND'), 3000);
              return () => clearTimeout(t1);
          }

          // === DEMO: VOICE SEQUENCE ===
          if (featureId === 'voice') {
              setLiveState('DISCONNECTED');
              const t1 = setTimeout(() => setLiveState('CONNECTED'), 1000); // Simulate connected visual
              const t2 = setTimeout(() => setIsSpeaking(true), 1500); // Simulate wave
              const t3 = setTimeout(() => { setIsSpeaking(false); setLiveState('DISCONNECTED'); }, 5000);
              return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
          }
      }
  }, [forcedFeatureIndex]);

  // Auto-cycle through features (Only if not forced and not interacting)
  useEffect(() => {
    if (forcedFeatureIndex !== null) return; // Disable auto-cycle during specific tour steps

    const duration = 8000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      const currentId = features[activeFeature].id;
      if ((currentId === 'chat' && (chatInput.length > 0 || isTyping)) || currentId === 'voice' || liveState === 'CONNECTED' || currentId === 'analyzer' || currentId === 'match' || currentId === 'wallet') {
         return;
      }
      currentStep++;
      setProgress((currentStep / steps) * 100);
      if (currentStep >= steps) {
        setActiveFeature((prev) => (prev + 1) % features.length);
        currentStep = 0;
        setProgress(0);
      }
    }, intervalTime);
    return () => clearInterval(timer);
  }, [activeFeature, chatInput, isTyping, liveState, forcedFeatureIndex]);

  useEffect(() => {
    return () => {
        if (closeSessionRef.current) closeSessionRef.current();
        if (inputContextRef.current) inputContextRef.current.close();
        if (outputContextRef.current) outputContextRef.current.close();
    };
  }, []);

  const handleManualSelect = (index: number) => {
    setActiveFeature(index);
    setProgress(0);
  };

  const generateTextResponse = async (input: string) => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: input }] }],
          config: { systemInstruction: PADDY_SYSTEM_INSTRUCTION }
      });
      return response.text || "System Error.";
  };

  const handleSendChat = async (message?: string) => {
    const userMsg = message || chatInput;
    if (!userMsg.trim()) return;
    if (!message) setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    try {
        const text = await generateTextResponse(userMsg);
        setChatHistory(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
        setChatHistory(prev => [...prev, { role: 'model', text: "Connection interrupted." }]);
    } finally {
        setIsTyping(false);
    }
  };

  const stopLiveSession = () => {
      if (closeSessionRef.current) { closeSessionRef.current(); closeSessionRef.current = null; }
      if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
      if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
      if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
      if (inputContextRef.current) inputContextRef.current.close();
      if (outputContextRef.current) outputContextRef.current.close();
      activeSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
      activeSourcesRef.current = [];
      setLiveState('DISCONNECTED');
      setIsSpeaking(false);
      setVolumeLevel(0);
  };

  const startLiveSession = async () => {
    try {
        setLiveState('CONNECTING');
        setErrorMsg('');
        const AudioCtor = (window.AudioContext || (window as any).webkitAudioContext);
        const inputCtx = new AudioCtor({ sampleRate: 16000 });
        if (inputCtx.state === 'suspended') await inputCtx.resume();
        inputContextRef.current = inputCtx;
        const outputCtx = new AudioCtor();
        if (outputCtx.state === 'suspended') await outputCtx.resume();
        outputContextRef.current = outputCtx;
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
            mediaStreamRef.current = stream;
        } catch (err) {
            console.error("Microphone denied", err);
            setErrorMsg("Mic Access Denied");
            setLiveState('ERROR');
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
                systemInstruction: PADDY_SYSTEM_INSTRUCTION,
            },
            callbacks: {
                onopen: () => {
                   setLiveState('CONNECTED');
                   nextStartTimeRef.current = outputCtx.currentTime + 0.1; 
                   const source = inputCtx.createMediaStreamSource(stream);
                   const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                   processor.onaudioprocess = (e) => {
                       const inputData = e.inputBuffer.getChannelData(0);
                       const pcm16 = floatTo16BitPCM(inputData);
                       const base64 = arrayBufferToBase64(pcm16.buffer);
                       sessionPromise.then(session => { session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64 } }); });
                       let sum = 0; for(let i=0; i<inputData.length; i+=10) sum += inputData[i]*inputData[i];
                       setVolumeLevel(Math.sqrt(sum/(inputData.length/10)) * 5); 
                   };
                   source.connect(processor);
                   processor.connect(inputCtx.destination);
                   sourceRef.current = source;
                   processorRef.current = processor;
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                        setIsSpeaking(true);
                        const uint8 = base64ToUint8Array(audioData);
                        const audioBuffer = outputCtx.createBuffer(1, uint8.length / 2, 24000);
                        const channelData = audioBuffer.getChannelData(0);
                        const dataView = new DataView(uint8.buffer);
                        for (let i = 0; i < uint8.length / 2; i++) { channelData[i] = dataView.getInt16(i * 2, true) / 32768.0; }
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        const startTime = Math.max(outputCtx.currentTime, nextStartTimeRef.current);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + audioBuffer.duration;
                        activeSourcesRef.current.push(source);
                        source.onended = () => { activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source); if (activeSourcesRef.current.length === 0) setIsSpeaking(false); };
                    }
                },
                onclose: () => { setLiveState('DISCONNECTED'); },
                onerror: (err) => { console.error("Live Error", err); setLiveState('ERROR'); setErrorMsg("Connection Lost"); }
            }
        });
        closeSessionRef.current = () => { sessionPromise.then(s => s.close()); };
    } catch (e) { console.error(e); setLiveState('ERROR'); setErrorMsg("Init Failed"); }
  };

  const renderScreenContent = () => {
    switch (currentFeature.screen) {
        case 'RANKING':
            return (
                <div className="flex flex-col h-full bg-carbon text-white relative pt-12">
                    <StatusBar />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,214,255,0.1)_0%,black_60%)] pointer-events-none"></div>
                    
                    {/* Header */}
                    <div className="px-6 pb-4 relative z-10 flex justify-between items-end border-b border-white/5">
                        <div>
                            <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-1">Season 4 • Week 12</div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Global <span className="text-neon-blue">Elite</span></h3>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                            <Trophy size={14} className="text-neon-blue" />
                        </div>
                    </div>

                    {/* Top 3 Podium */}
                    <div className="relative h-48 flex items-end justify-center gap-4 px-4 pb-6 z-10">
                         {/* Rank 2 */}
                         <div className="flex flex-col items-center">
                            <div className="relative w-14 h-14 mb-2">
                                <Hexagon className="w-full h-full text-gray-800 fill-gray-900 stroke-[2]" />
                                <div className="absolute inset-[3px] clip-path-hexagon overflow-hidden" style={{clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'}}>
                                    <img src={ASSETS.avatars.rank2} className="w-full h-full object-cover opacity-90 grayscale" />
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[9px] font-bold px-1.5 rounded shadow">#2</div>
                            </div>
                            <div className="h-16 w-14 bg-gradient-to-t from-gray-900 to-gray-800 rounded-t border-t border-gray-700 flex flex-col items-center justify-end pb-2">
                                <span className="text-[9px] font-mono text-gray-400">2380</span>
                            </div>
                         </div>
                         
                         {/* Rank 1 */}
                         <div className="flex flex-col items-center -mb-2 z-20">
                            <div className="relative w-20 h-20 mb-2">
                                <div className="absolute inset-0 bg-neon-blue blur-xl opacity-30"></div>
                                <Hexagon className="w-full h-full text-neon-blue fill-gray-900 stroke-[2]" />
                                <div className="absolute inset-[3px] clip-path-hexagon overflow-hidden" style={{clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'}}>
                                    <img src={ASSETS.avatars.rank1} className="w-full h-full object-cover" />
                                </div>
                                <Crown size={16} className="absolute -top-4 left-1/2 -translate-x-1/2 text-neon-blue drop-shadow-[0_0_10px_#2DD6FF] animate-bounce" />
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-neon-blue text-black text-[10px] font-black px-2 py-0.5 rounded shadow">#1</div>
                            </div>
                            <div className="h-24 w-16 bg-gradient-to-t from-neon-blue/20 to-neon-blue/5 rounded-t border-t border-neon-blue/50 flex flex-col items-center justify-end pb-3 shadow-[0_0_30px_rgba(45,214,255,0.1)]">
                                <span className="text-xs font-bold text-neon-blue">2450</span>
                                <span className="text-[8px] font-mono text-neon-blue/70">RP</span>
                            </div>
                         </div>

                         {/* Rank 3 */}
                         <div className="flex flex-col items-center">
                            <div className="relative w-14 h-14 mb-2">
                                <Hexagon className="w-full h-full text-gray-800 fill-gray-900 stroke-[2]" />
                                <div className="absolute inset-[3px] clip-path-hexagon overflow-hidden" style={{clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)'}}>
                                    <img src={ASSETS.avatars.rank3} className="w-full h-full object-cover opacity-90 grayscale" />
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[9px] font-bold px-1.5 rounded shadow">#3</div>
                            </div>
                            <div className="h-12 w-14 bg-gradient-to-t from-gray-900 to-gray-800 rounded-t border-t border-gray-700 flex flex-col items-center justify-end pb-2">
                                <span className="text-[9px] font-mono text-gray-400">2310</span>
                            </div>
                         </div>
                    </div>

                    {/* Leaderboard List */}
                    <div className="flex-1 bg-black/40 backdrop-blur-md rounded-t-3xl border-t border-white/10 overflow-hidden flex flex-col relative z-20">
                         <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 overflow-x-auto no-scrollbar">
                            {['GLOBAL', 'REGIONAL', 'FRIENDS'].map((tab, i) => (
                                <button key={tab} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${i === 0 ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>
                                    {tab}
                                </button>
                            ))}
                         </div>
                         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 pb-20">
                            {[4,5,6,7,8,9,10].map((rank, i) => (
                                <div key={rank} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                                     <div className="font-mono text-gray-500 w-6 text-center text-sm font-bold">{rank}</div>
                                     <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10 relative">
                                         <img src={ASSETS.avatars[`rank${rank}` as keyof typeof ASSETS.avatars]} className="w-full h-full object-cover" />
                                         {/* Status Dot */}
                                         <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${i % 3 === 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                     </div>
                                     <div className="flex-1">
                                         <div className="text-sm font-bold text-white group-hover:text-neon-blue transition-colors">
                                             {PLAYER_NAMES[rank] || `Player_${rank}`}
                                         </div>
                                         <div className="flex items-center gap-2">
                                             <span className="text-[9px] text-gray-500 font-mono">
                                                 {['Dubai, UAE', 'London, UK', 'Madrid, ES', 'Paris, FR', 'Tokyo, JP'][i % 5]}
                                             </span>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-sm font-mono font-bold text-white">2,1{90 - i*10}</div>
                                         <div className={`text-[9px] font-mono flex items-center justify-end gap-1 ${i % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                                             {i % 2 === 0 ? <ArrowUp size={8} /> : <ArrowDown size={8} />} {i % 2 === 0 ? '12' : '4'}
                                         </div>
                                     </div>
                                </div>
                            ))}
                         </div>
                         
                         {/* Sticky "Me" Rank */}
                         <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
                             <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/30 backdrop-blur-md">
                                 <div className="font-mono text-neon-blue w-6 text-center text-sm font-bold">42</div>
                                 <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-neon-blue">
                                     <img src={ASSETS.avatars.me} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="text-sm font-bold text-white">You</div>
                                     <div className="text-[9px] text-neon-blue font-mono">Top 5% Global</div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-sm font-mono font-bold text-neon-blue">1,850</div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            );

        case 'BOOKING':
            return (
                <div className="flex flex-col h-full bg-black relative pt-12">
                    <StatusBar />
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/80 backdrop-blur-sm z-10">
                        <div>
                            <div className="text-[10px] text-gray-400 font-mono tracking-wider">LOCATION</div>
                            <div className="text-white font-bold flex items-center gap-1 text-sm">DXB MAIN <ChevronDown size={12} className="text-neon-lime"/></div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue shadow-[0_0_10px_rgba(45,214,255,0.2)]">
                            <Calendar size={14} />
                        </div>
                    </div>
                    <div className="flex overflow-x-auto gap-2 p-4 no-scrollbar border-b border-white/5">
                        {['MON 12', 'TUE 13', 'WED 14', 'THU 15'].map((d, i) => (
                            <div key={i} className={`flex-shrink-0 w-14 h-16 rounded border ${i===1 ? 'bg-neon-lime text-black border-neon-lime shadow-[0_0_15px_#ACFF01]' : 'bg-white/5 border-white/10 text-gray-400'} flex flex-col items-center justify-center transition-all`}>
                                <span className="text-[9px] font-bold uppercase tracking-wider">{d.split(' ')[0]}</span>
                                <span className="text-lg font-black">{d.split(' ')[1]}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        <div className="mb-6">
                            <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-widest flex items-center gap-2"><MapPin size={10}/> Select Court</div>
                            <div className="relative h-32 rounded-lg overflow-hidden border border-white/20 group cursor-pointer ring-1 ring-transparent hover:ring-neon-lime transition-all">
                                <img 
                                    src={bookingImage} 
                                    onError={() => setBookingImage('https://images.unsplash.com/photo-1554068865-2415f90d23bb?q=80&w=600&auto=format&fit=crop')}
                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-neon-lime font-bold text-sm flex items-center gap-2">Center Court <StarBadge /></div>
                                            <div className="text-[9px] text-gray-300 mt-0.5">Panorama Glass • Pro Surface</div>
                                        </div>
                                        <div className="px-2 py-1 bg-neon-lime/20 border border-neon-lime text-neon-lime text-[9px] rounded font-mono font-bold animate-pulse">AVAILABLE</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-widest flex items-center gap-2"><Clock size={10}/> Time Slots</div>
                            <div className="grid grid-cols-3 gap-2 pb-4">
                                {['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'].map((time, i) => {
                                    const isBooked = i === 3 || i === 6 || i === 7;
                                    const isSelected = selectedSlot === i;
                                    return (
                                        <div key={time} className={`
                                            relative py-3 rounded border text-center font-mono text-xs overflow-hidden group
                                            ${isBooked 
                                                ? 'bg-red-900/10 border-red-900/30 text-red-700 decoration-line-through cursor-not-allowed' 
                                                : isSelected 
                                                    ? 'bg-neon-lime text-black border-neon-lime shadow-[0_0_10px_#ACFF01]' 
                                                    : 'bg-white/5 border-white/10 text-white hover:border-neon-lime hover:bg-neon-lime/10 cursor-pointer hover:shadow-[0_0_10px_rgba(172,255,1,0.2)] transition-all'
                                            }
                                        `}>
                                            <span className="relative z-10">{time}</span>
                                            {!isBooked && !isSelected && (
                                                <div className="absolute inset-0 bg-neon-lime/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-white/10 bg-black z-10">
                         <button className={`w-full py-3 font-bold uppercase tracking-widest text-xs transition-colors rounded ${bookingStep === 'CONFIRMED' ? 'bg-green-500 text-black' : bookingStep === 'CONFIRMING' ? 'bg-white text-black' : 'bg-neon-lime hover:bg-white text-black'}`}>
                             {bookingStep === 'CONFIRMED' ? 'BOOKING CONFIRMED' : bookingStep === 'CONFIRMING' ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
                         </button>
                    </div>
                </div>
            );

        case 'ANALYZER':
            return (
                <div className="flex flex-col h-full bg-black relative pt-12">
                    <StatusBar />
                    <div className="flex-1 relative overflow-hidden bg-gray-900">
                         {/* High-Tech Background */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(172,255,1,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(172,255,1,0.05)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
                         
                         {/* 3D Skeleton / Wireframe Overlay */}
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                                <div className="absolute top-0 w-1 h-2 bg-neon-lime"></div>
                                <div className="absolute bottom-0 w-1 h-2 bg-neon-lime"></div>
                            </div>
                            <div className="absolute w-48 h-48 border border-neon-blue/20 rounded-full flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                                <div className="absolute left-0 w-2 h-1 bg-neon-blue"></div>
                                <div className="absolute right-0 w-2 h-1 bg-neon-blue"></div>
                            </div>
                            
                            {/* Abstract Swing Arc */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                                <motion.path 
                                    d="M 100 400 C 150 300, 200 100, 300 150" 
                                    stroke={analyzerTab === 'TRAJ' ? "#2DD6FF" : "#ACFF01"} strokeWidth="4" fill="none" strokeLinecap="round"
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <motion.circle cx="300" cy="150" r="4" fill={analyzerTab === 'TRAJ' ? "#2DD6FF" : "#ACFF01"} animate={{ opacity: [0,1,0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                
                                {/* Keypoints */}
                                <circle cx="150" cy="300" r="3" fill="white" />
                                <circle cx="200" cy="100" r="3" fill="white" />
                            </svg>
                         </div>

                         {/* Floating Metrics HUD */}
                         <div className="absolute top-4 left-4">
                             <div className="bg-black/60 backdrop-blur border-l-2 border-neon-lime pl-3 py-1">
                                 <div className="text-[9px] text-gray-400 font-mono tracking-widest">IMPACT FORCE</div>
                                 <div className="text-xl font-black text-white">840N</div>
                             </div>
                         </div>

                         <div className="absolute top-4 right-4 text-right">
                             <div className="bg-black/60 backdrop-blur border-r-2 border-neon-blue pr-3 py-1">
                                 <div className="text-[9px] text-gray-400 font-mono tracking-widest">RACKET SPEED</div>
                                 <div className="text-xl font-black text-white">112 <span className="text-xs text-gray-500">KM/H</span></div>
                             </div>
                         </div>
                    </div>
                    
                    {/* Analysis Detail Panel */}
                    <div className="h-1/3 bg-black border-t border-white/10 z-20 flex flex-col">
                         <div className="flex items-center justify-between p-4 border-b border-white/5">
                             <div className="flex gap-4">
                                 <button onClick={() => setAnalyzerTab('BIO')} className={`text-[10px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${analyzerTab === 'BIO' ? 'text-neon-lime border-neon-lime' : 'text-gray-500 border-transparent'}`}>Biomechanics</button>
                                 <button onClick={() => setAnalyzerTab('TRAJ')} className={`text-[10px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${analyzerTab === 'TRAJ' ? 'text-neon-blue border-neon-blue' : 'text-gray-500 border-transparent'}`}>Trajectory</button>
                             </div>
                             <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full cursor-pointer hover:bg-white/10" onClick={() => setShowProComparison(!showProComparison)}>
                                 <div className={`w-2 h-2 rounded-full ${showProComparison ? 'bg-neon-lime' : 'bg-gray-600'}`}></div>
                                 <span className="text-[9px] font-mono text-gray-300">PRO MODE</span>
                             </div>
                         </div>
                         
                         <div className="flex-1 p-4 flex gap-4 items-center">
                              {/* Radial Progress */}
                              <div className="w-20 h-20 relative flex items-center justify-center">
                                  <svg className="w-full h-full -rotate-90">
                                      <circle cx="40" cy="40" r="36" fill="none" stroke="#222" strokeWidth="6" />
                                      <circle cx="40" cy="40" r="36" fill="none" stroke="#ACFF01" strokeWidth="6" strokeDasharray="226" strokeDashoffset="22" strokeLinecap="round" />
                                  </svg>
                                  <div className="absolute flex flex-col items-center">
                                      <span className="text-lg font-black text-white">92</span>
                                      <span className="text-[8px] text-gray-500 uppercase">Score</span>
                                  </div>
                              </div>

                              {/* Bar Stats */}
                              <div className="flex-1 space-y-3">
                                  {analyzerBarData.map((stat, i) => (
                                      <div key={i}>
                                          <div className="flex justify-between text-[9px] text-gray-400 mb-1 uppercase font-mono">
                                              <span>{stat.name}</span>
                                              <span>{stat.val}/100</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                              <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.val}%` }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: stat.fill }}
                                              />
                                          </div>
                                      </div>
                                  ))}
                              </div>
                         </div>
                    </div>
                </div>
            );

        case 'CHAT':
            return (
                <div className="flex flex-col h-full bg-black relative pt-12">
                    <StatusBar />
                    <div className="p-3 border-b border-white/10 bg-black/80 flex items-center gap-3 backdrop-blur-sm z-10">
                        <div className="w-8 h-8 rounded-full bg-neon-lime flex items-center justify-center relative">
                            <BrainCircuit size={16} className="text-black" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white leading-none">Paddy AI</div>
                            <div className="text-[9px] text-gray-500 font-mono tracking-wider">ONLINE • V2.4</div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                         {chatHistory.map((msg, i) => (
                             <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                             >
                                 <div className={`
                                     max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed
                                     ${msg.role === 'user' 
                                         ? 'bg-neon-lime text-black rounded-tr-none font-medium' 
                                         : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}
                                 `}>
                                     {msg.text}
                                 </div>
                             </motion.div>
                         ))}
                         {isTyping && (
                             <div className="flex justify-start">
                                 <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                     <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                 </div>
                             </div>
                         )}
                         <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 bg-black border-t border-white/10">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                placeholder="Ask Paddy..."
                                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-neon-lime transition-colors"
                            />
                            <button onClick={() => handleSendChat()} className="absolute right-1 top-1 w-7 h-7 bg-neon-lime rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"><Send size={12} /></button>
                        </div>
                    </div>
                </div>
            );

        case 'VOICE':
            return (
                <div className="flex flex-col h-full bg-black relative overflow-hidden pt-12">
                    <StatusBar />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-64 h-64 rounded-full border border-white/5 transition-all duration-300 ${isSpeaking ? 'scale-110 bg-neon-lime/5' : 'scale-100'}`}></div>
                        <div className={`absolute w-48 h-48 rounded-full border border-white/10 transition-all duration-300 ${isSpeaking ? 'scale-105 border-neon-lime/20' : 'scale-100'}`}></div>
                        <div className={`absolute w-32 h-32 rounded-full border border-white/10 transition-all duration-300 ${isSpeaking ? 'scale-110 border-neon-lime/40' : 'scale-100'}`}></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="mb-12">
                             <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-colors ${liveState === 'CONNECTED' ? 'border-neon-lime/30 bg-neon-lime/10' : 'border-white/10 bg-white/5'}`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${liveState === 'CONNECTED' ? 'bg-neon-lime animate-pulse' : 'bg-red-500'}`}></div>
                                 <span className={`text-[10px] font-mono uppercase tracking-widest ${liveState === 'CONNECTED' ? 'text-neon-lime' : 'text-gray-500'}`}>
                                     {liveState === 'CONNECTED' ? 'Live Voice Active' : liveState}
                                 </span>
                             </div>
                        </div>
                        <div className="relative mb-12">
                             <button 
                                onClick={liveState === 'CONNECTED' ? stopLiveSession : startLiveSession}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative z-20 group ${liveState === 'CONNECTED' ? 'bg-black border-2 border-neon-lime shadow-[0_0_30px_rgba(172,255,1,0.3)]' : 'bg-white text-black hover:scale-105'}`}
                             >
                                 {liveState === 'CONNECTED' ? (
                                     <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                         <div className="flex items-end gap-1 h-8">
                                             {[...Array(5)].map((_, i) => (
                                                 <motion.div key={i} className="w-1.5 bg-neon-lime rounded-full" animate={{ height: [10, 10 + (volumeLevel * (i+1)), 10] }} transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }} />
                                             ))}
                                         </div>
                                     </div>
                                 ) : ( <Mic size={32} /> )}
                             </button>
                             {liveState !== 'CONNECTED' && ( <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50 z-10 pointer-events-none"></div> )}
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{liveState === 'CONNECTED' ? 'Listening...' : 'Tap to Speak'}</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">{liveState === 'CONNECTED' ? "Ask Paddy anything. Analysis, booking, or strategy." : "Experience hands-free control with our Gemini-powered voice assistant."}</p>
                        {errorMsg && ( <div className="mt-4 text-red-500 text-xs font-mono bg-red-500/10 px-3 py-1 rounded border border-red-500/20">{errorMsg}</div> )}
                    </div>
                </div>
            );

        case 'PASSPORT':
            return (
                <div className="flex flex-col h-full bg-black relative p-6 pt-14 overflow-hidden">
                     <StatusBar />
                     <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(100,20,200,0.1)_0%,transparent_50%,rgba(45,214,255,0.1)_100%)]"></div>
                     <div className="relative z-10 flex flex-col h-full">
                         <div className="flex justify-between items-start mb-8">
                             <div>
                                 <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter">PadWorld<br/><span className="text-purple-400">Passport</span></h3>
                             </div>
                             <Fingerprint size={32} className="text-purple-400 opacity-50" />
                         </div>
                         <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md mb-6 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                             <div className="flex items-center gap-4 mb-6">
                                 <div className="w-16 h-16 rounded-full border-2 border-purple-400 p-0.5">
                                     <img src={ASSETS.avatars.me} className="w-full h-full rounded-full object-cover grayscale" />
                                 </div>
                                 <div>
                                     <div className="text-xl font-bold text-white uppercase">Alex Chen</div>
                                     <div className="text-xs font-mono text-purple-400">ID: PW-8829-X</div>
                                 </div>
                             </div>
                             <div className="flex gap-4 mb-4">
                                 <div>
                                     <div className="text-[9px] text-gray-500 uppercase tracking-wider">Level</div>
                                     <div className="text-white font-mono text-lg">PRO • T1</div>
                                 </div>
                                 <div>
                                     <div className="text-[9px] text-gray-500 uppercase tracking-wider">Region</div>
                                     <div className="text-white font-mono text-lg">EMEA</div>
                                 </div>
                             </div>
                             <div className="w-full h-24 relative mt-2 opacity-80">
                                 <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                    <polygon points="50,5 90,20 80,45 20,45 10,20" fill="rgba(192, 132, 252, 0.2)" stroke="#c084fc" strokeWidth="1" />
                                    <polygon points="50,15 80,25 70,40 30,40 20,25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                                    <circle cx="50" cy="5" r="2" fill="#c084fc" />
                                    <circle cx="90" cy="20" r="2" fill="#c084fc" />
                                    <circle cx="80" cy="45" r="2" fill="#c084fc" />
                                    <circle cx="20" cy="45" r="2" fill="#c084fc" />
                                    <circle cx="10" cy="20" r="2" fill="#c084fc" />
                                    <text x="50" y="-2" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="monospace">PWR</text>
                                    <text x="95" y="20" textAnchor="start" fontSize="6" fill="#fff" fontFamily="monospace">SPD</text>
                                    <text x="5" y="20" textAnchor="end" fontSize="6" fill="#fff" fontFamily="monospace">TEC</text>
                                 </svg>
                             </div>
                         </div>
                         <div className="flex-1">
                             <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Trophy size={12}/> Trophy Cabinet (NFT)</div>
                             <div className="grid grid-cols-3 gap-3">
                                 {[1,2,3].map((i) => (
                                     <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded flex items-center justify-center relative group cursor-pointer hover:border-purple-400/50 transition-colors">
                                         <Hexagon className="text-gray-700 w-12 h-12 stroke-1 group-hover:text-purple-400/30 transition-colors" />
                                         <Trophy size={16} className="absolute text-yellow-500 drop-shadow-lg" />
                                         <div className="absolute bottom-1 text-[8px] text-gray-500">S{i} Winner</div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>
                </div>
            );

        case 'WALLET':
            return (
                <div className="flex flex-col h-full bg-[#0a0a0a] relative pt-12 overflow-hidden">
                    <StatusBar />
                    <div className="px-6 pt-6 pb-2 bg-[#0a0a0a] relative z-20">
                        {/* Header Stats */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-black text-sm shadow-[0_0_15px_rgba(234,179,8,0.4)]">P</div>
                                <div>
                                    <span className="font-bold text-white text-lg block leading-none">PAD/USD</span>
                                    <span className="text-[10px] text-gray-500 font-mono">TOKEN ID: #882</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 font-mono mb-0.5">24H VOLUME</div>
                                <div className="text-white font-mono text-xs">24.5M</div>
                            </div>
                        </div>

                        {/* Main Balance */}
                        <div className="text-center mb-6 py-4 border-y border-white/5">
                            <div className="text-gray-500 text-[10px] mb-1 font-mono tracking-widest uppercase">Total Balance</div>
                            <div className="text-5xl font-black text-white font-mono tracking-tighter mb-2">$24,500.00</div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-mono">
                                <TrendingUp size={12} /> +5.24% <span className="opacity-50">| 24H</span>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex gap-2 h-40 mb-4">
                            <div className="flex-1 relative border border-white/5 rounded-lg bg-white/5 overflow-hidden">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={walletData}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} fill="url(#colorVal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <div className="absolute top-2 left-2 text-[8px] text-gray-500 font-mono bg-black/50 px-1 rounded">1H CHART</div>
                            </div>
                            
                            {/* Order Book Column - Fixed Overflow */}
                            <div className="w-1/3 flex flex-col h-full bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                <div className="text-[8px] text-gray-500 text-center py-1 border-b border-white/5 font-mono">ORDER BOOK</div>
                                <div className="flex-1 overflow-hidden flex flex-col justify-center gap-[1px] text-[8px] font-mono p-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={`sell-${i}`} className="flex justify-between text-red-400">
                                            <span>.45{(20+i)}</span>
                                            <span className="opacity-50">{(Math.random()*50).toFixed(0)}</span>
                                        </div>
                                    )).reverse()}
                                    <div className="text-center py-0.5 text-white font-bold my-0.5 text-[9px]">0.4520</div>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={`buy-${i}`} className="flex justify-between text-green-400">
                                            <span>.45{(19-i)}</span>
                                            <span className="opacity-50">{(Math.random()*50).toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pb-2">
                            <button className="bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold text-xs uppercase transition-colors shadow-lg shadow-green-900/20">Buy PAD</button>
                            <button className="bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold text-xs uppercase transition-colors">Sell</button>
                        </div>
                    </div>

                    {/* Scrollable Transaction List */}
                    <div className="flex-1 bg-black border-t border-white/10 p-5 overflow-y-auto custom-scrollbar">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex justify-between items-center sticky top-0 bg-black py-2 z-10">
                            <span>Recent Activity</span>
                            <span className="text-neon-blue cursor-pointer">View All</span>
                        </div>
                        <div className="space-y-3">
                             {[
                                 { pair: 'PAD/USDT', type: 'Buy', price: '0.4200', amount: '5,000', time: '12:42:01', status: 'Filled' },
                                 { pair: 'PAD/BTC', type: 'Sell', price: '0.000012', amount: '1,200', time: '11:20:00', status: 'Pending' },
                                 { pair: 'PAD/USDT', type: 'Buy', price: '0.4150', amount: '2,500', time: '09:15:33', status: 'Filled' },
                                 { pair: 'PAD/ETH', type: 'Buy', price: '0.00021', amount: '10,000', time: 'Yesterday', status: 'Filled' }
                             ].map((tx, i) => (
                                 <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                     <div className="flex items-center gap-3">
                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'Buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                             {tx.type === 'Buy' ? <ArrowDown size={14}/> : <ArrowUp size={14}/>}
                                         </div>
                                         <div>
                                             <div className="text-white text-xs font-bold flex items-center gap-2">
                                                 {tx.pair}
                                             </div>
                                             <div className="text-[9px] text-gray-500 mt-0.5 font-mono">{tx.time} • {tx.status}</div>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-white text-xs font-mono font-bold">{tx.type === 'Buy' ? '+' : '-'}{tx.amount}</div>
                                         <div className="text-[9px] text-gray-500">@ {tx.price}</div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            );

        case 'MATCH':
            return (
                 <div className="flex flex-col h-full bg-black relative pt-12 overflow-hidden">
                     <StatusBar />
                     
                     {/* Background Map Effect */}
                     <div className="absolute inset-0 bg-gray-900 opacity-50">
                         <svg className="w-full h-full stroke-gray-700 stroke-[0.5] opacity-30" viewBox="0 0 100 100">
                             <path d="M 0 20 L 100 20 M 0 40 L 100 40 M 0 60 L 100 60 M 0 80 L 100 80" />
                             <path d="M 20 0 L 20 100 M 40 0 L 40 100 M 60 0 L 60 100 M 80 0 L 80 100" />
                         </svg>
                     </div>

                     <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                         <AnimatePresence mode="wait">
                            {matchState === 'SCANNING' ? (
                                <motion.div 
                                    key="scanning"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative flex items-center justify-center"
                                >
                                    {/* Radar Circles */}
                                    <div className="w-64 h-64 border border-neon-blue/30 rounded-full absolute"></div>
                                    <div className="w-48 h-48 border border-neon-blue/30 rounded-full absolute"></div>
                                    <div className="w-32 h-32 border border-neon-blue/30 rounded-full absolute"></div>
                                    
                                    {/* Center Dot */}
                                    <div className="w-4 h-4 bg-neon-blue rounded-full shadow-[0_0_20px_#2DD6FF] z-20"></div>

                                    {/* Scanning Sweep */}
                                    <motion.div 
                                        className="w-64 h-64 absolute rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(45,214,255,0.4)_360deg)] z-10"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />

                                    {/* Blips */}
                                    <motion.div 
                                        className="absolute w-2 h-2 bg-white rounded-full top-12 left-20 shadow-[0_0_10px_white]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                    />
                                    <motion.div 
                                        className="absolute w-2 h-2 bg-white rounded-full bottom-16 right-24 shadow-[0_0_10px_white]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                                    />

                                    <div className="absolute -bottom-24 text-center">
                                        <div className="text-neon-blue font-mono text-xs animate-pulse tracking-widest">SCANNING SECTOR 4...</div>
                                        <div className="text-gray-500 text-[9px] mt-1">Looking for similar NTRP Rating</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="found"
                                    initial={{ opacity: 0, scale: 1.2 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full px-6"
                                >
                                    <div className="bg-black/80 border border-neon-lime/50 rounded-xl p-6 backdrop-blur-md shadow-[0_0_50px_rgba(172,255,1,0.2)]">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Match Found</div>
                                            <div className="text-[10px] text-neon-lime font-mono border border-neon-lime/30 px-2 py-0.5 rounded">98% MATCH</div>
                                        </div>
                                        
                                        <div className="flex flex-col items-center mb-6">
                                            <div className="w-20 h-20 rounded-full border-2 border-neon-lime p-1 mb-3 relative">
                                                <img src={ASSETS.avatars.opponent} className="w-full h-full rounded-full object-cover" />
                                                <div className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-neon-lime">
                                                    <Zap size={10} className="text-neon-lime fill-current"/>
                                                </div>
                                            </div>
                                            <div className="text-white font-bold text-xl uppercase">Marcus V.</div>
                                            <div className="text-xs text-gray-400 font-mono">Level 4.5 • Aggressive Left</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-6 text-center">
                                            <div className="bg-white/5 rounded p-2">
                                                <div className="text-[9px] text-gray-500">Win Rate</div>
                                                <div className="text-white font-mono">68%</div>
                                            </div>
                                            <div className="bg-white/5 rounded p-2">
                                                <div className="text-[9px] text-gray-500">Matches</div>
                                                <div className="text-white font-mono">142</div>
                                            </div>
                                        </div>

                                        <button className="w-full py-3 bg-neon-lime text-black font-bold uppercase text-xs rounded hover:bg-white transition-colors flex items-center justify-center gap-2">
                                            <RotateCcw size={14} /> Accept Challenge
                                        </button>
                                        <button 
                                            onClick={() => setMatchState('SCANNING')}
                                            className="w-full py-3 mt-2 text-gray-500 font-bold uppercase text-[10px] hover:text-white transition-colors"
                                        >
                                            Decline & Resume Scan
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                     </div>
                 </div>
            );

        default:
            return <div className="p-4 text-white">Select a feature</div>;
    }
  };

  return (
    <section className="py-24 bg-black border-y border-white/5 relative overflow-hidden" id="chat">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-16 text-center">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 border border-neon-lime/30 bg-neon-lime/5 rounded-full mb-6"
           >
             <Sparkles size={12} className="text-neon-lime" />
             <span className="font-mono text-[10px] text-neon-lime tracking-widest uppercase">The Super App</span>
           </motion.div>
           
           <h2 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter text-white mb-6 leading-[0.9]">
             One App.<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">Infinite Possibilities.</span>
           </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
           
           {/* Left: Feature Menu */}
           <div className="flex-1 w-full lg:w-auto">
              <div className="space-y-4">
                 {features.map((feature, idx) => (
                    <motion.div 
                       key={feature.id}
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       onClick={() => handleManualSelect(idx)}
                       className={`
                          group relative p-6 rounded-2xl cursor-pointer border transition-all duration-500 overflow-hidden
                          ${activeFeature === idx ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}
                       `}
                    >
                       {/* Progress Bar Background for Active Item */}
                       {activeFeature === idx && (
                           <div className="absolute bottom-0 left-0 h-[2px] bg-neon-lime transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
                       )}

                       <div className="flex items-start gap-4 relative z-10">
                          <div className={`p-3 rounded-full ${activeFeature === idx ? feature.bg + ' text-black' : 'bg-white/5 text-gray-500 group-hover:text-white'} transition-colors`}>
                             <feature.icon size={24} />
                          </div>
                          <div>
                             <h3 className={`text-xl font-bold uppercase tracking-tight mb-2 ${activeFeature === idx ? 'text-white' : 'text-gray-500 group-hover:text-white'} transition-colors`}>
                                {feature.title}
                             </h3>
                             <p className={`text-sm font-light leading-relaxed max-w-sm ${activeFeature === idx ? 'text-gray-300' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                {feature.desc}
                             </p>
                          </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>

           {/* Right: Phone Simulator */}
           <div className="flex-1 relative w-full flex justify-center lg:justify-end">
              <div className="relative w-[320px] h-[660px] bg-[#1a1a1a] rounded-[3.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10 border-[6px] border-[#2a2a2a] z-20">
                 {/* Titanium Frame Effect */}
                 <div className="absolute inset-0 rounded-[3.2rem] border-[2px] border-[#3a3a3a] pointer-events-none z-50 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"></div>
                 
                 {/* Dynamic Island Area */}
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-[70] flex justify-center items-center shadow-lg">
                     {/* Camera / Sensor cutouts simulation */}
                     <div className="w-[80px] h-[20px] bg-[#0a0a0a] rounded-full flex items-center justify-end pr-2">
                        <div className="w-3 h-3 rounded-full bg-[#1a1a1a] opacity-50"></div>
                     </div>
                 </div>

                 {/* Screen Content Container */}
                 <div className="absolute inset-[4px] rounded-[3rem] bg-black overflow-hidden z-30">
                     <AnimatePresence mode="wait">
                         <motion.div 
                            key={activeFeature}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full w-full"
                         >
                            {renderScreenContent()}
                         </motion.div>
                     </AnimatePresence>
                 </div>

                 {/* Home Indicator */}
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/40 rounded-full z-[80]"></div>
              </div>
              
              {/* Decorative Glow behind phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[700px] bg-neon-blue/20 blur-[100px] -z-10 pointer-events-none"></div>
           </div>
        </div>
      </div>
    </section>
  );
};