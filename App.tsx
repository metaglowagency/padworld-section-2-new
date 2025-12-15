import React, { useState, useRef, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Hero } from './components/Hero';
import { SmartCourt } from './components/SmartCourt';
import { AIVision } from './components/AIVision';
import { Analytics } from './components/Analytics';
import { Ecosystem } from './components/Ecosystem';
import { AutoReferee } from './components/AutoReferee';
import { PadChat } from './components/PadChat';
import { Button } from './components/ui/Button';
import { Cursor } from './components/ui/Cursor';
import { SectionDivider } from './components/ui/SectionDivider';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState } from './types';
import { ArrowUpRight, Activity, Play, Square, Volume2, VolumeX, Loader2, Sparkles, StopCircle, Mic, X, MessageSquare, ChevronDown, Headphones, Radio, Download } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

// --- CONFIGURATION ---
// 🎵 AUDIO SETTINGS 🎵
const BACKGROUND_MUSIC_URL = '/padworld_theme.mp3'; 
const PODCAST_URL = '/padworld_podcast.mp3'; // Priority: Local File (NotebookLM export)

// --- AUDIO HELPERS FOR TTS ---
function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// --- DUAL AUDIO ENGINE (TRACK OR PROCEDURAL) ---
const useBackgroundMusic = (active: boolean) => {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Procedural Fallback Refs
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    if (!active) return;

    // STRATEGY A: Play External Track (if URL is provided)
    if (BACKGROUND_MUSIC_URL) {
        const audio = new Audio(BACKGROUND_MUSIC_URL);
        audio.loop = true;
        audio.volume = 0; // Start silent for fade-in
        audioRef.current = audio;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented:", error);
            });
        }
        
        // Fade In
        let vol = 0;
        const fadeInterval = setInterval(() => {
            if (muted) return;
            if (vol < 0.2) { // Max volume 20%
                vol += 0.01;
                audio.volume = vol;
            } else {
                clearInterval(fadeInterval);
            }
        }, 100);

        return () => {
            clearInterval(fadeInterval);
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    } 
    
    // STRATEGY B: Procedural Drone (Fallback if no URL)
    else {
        const initAudio = async () => {
          try {
            const AudioCtor = (window.AudioContext || (window as any).webkitAudioContext);
            const ctx = new AudioCtor();
            ctxRef.current = ctx;
            
            // Master Gain
            const masterGain = ctx.createGain();
            masterGain.gain.value = muted ? 0 : 0.15;
            masterGain.connect(ctx.destination);
            gainRef.current = masterGain;

            // Drone Layers
            const createLayer = (freq: number, detune: number, type: OscillatorType) => {
              const osc = ctx.createOscillator();
              const filter = ctx.createBiquadFilter();
              
              osc.type = type;
              osc.frequency.value = freq;
              osc.detune.value = detune;

              filter.type = 'lowpass';
              filter.frequency.value = 100;
              filter.Q.value = 2;

              osc.connect(filter);
              filter.connect(masterGain);
              osc.start();
              return osc;
            };

            oscsRef.current.push(createLayer(55, 0, 'sawtooth')); // A1
            oscsRef.current.push(createLayer(55, 4, 'sawtooth')); 
            oscsRef.current.push(createLayer(110, -2, 'sine')); // A2

          } catch (e) {
            console.error("Audio init failed", e);
          }
        };

        initAudio();

        return () => {
          oscsRef.current.forEach(o => o.stop());
          oscsRef.current = [];
          if (ctxRef.current) ctxRef.current.close();
        };
    }
  }, [active]);

  // Handle Mute Toggling for both engines
  useEffect(() => {
    if (BACKGROUND_MUSIC_URL && audioRef.current) {
        audioRef.current.volume = muted ? 0 : 0.2;
    } else if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.setTargetAtTime(muted ? 0 : 0.15, ctxRef.current.currentTime, 0.5);
    }
  }, [muted]);

  return { muted, toggleMute: () => setMuted(!muted) };
};

const LoadingSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(172,255,1,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(172,255,1,0.05)_1px,transparent_1px)] bg-[length:40px_40px] opacity-20"></div>
      
      <div className="w-64 relative z-10">
        <div className="flex justify-between text-xs font-mono text-neon-lime mb-2 tracking-widest">
          <span>INITIALIZING</span>
          <span>SYSTEM V2.0</span>
        </div>
        <motion.div 
          className="h-1 bg-gray-900 w-full overflow-hidden"
        >
          <motion.div 
            className="h-full bg-neon-lime shadow-[0_0_15px_#ACFF01]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            onAnimationComplete={onComplete}
          />
        </motion.div>
        <div className="mt-4 space-y-1 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>- CONNECTING TO SENSORS...</motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>- LOADING AI MODELS...</motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>- CALIBRATING OPTICS...</motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }} className="text-neon-blue">- READY.</motion.div>
        </div>
      </div>
    </div>
  );
}

// --- TOUR DATA ---
const TOUR_STEPS = [
  {
    id: 'hero',
    script: "Welcome to PadWorld. We are building the first decentralized sports ecosystem powered by artificial intelligence. A new digital arena for the modern athlete.",
    label: "Introduction"
  },
  {
    id: 'court',
    script: "This is the Smart Court. It is fully connected and immersive. With 360-degree vision and pressure-sensitive floors, we track every movement in real-time.",
    label: "Smart Infrastructure"
  },
  {
    id: 'vision',
    script: "Our proprietary AI Vision system digitizes the physical world instantly. We calculate speed, spin, and trajectory with zero latency to gamify the experience.",
    label: "Computer Vision"
  },
  {
    id: 'referee',
    script: "Say goodbye to disputes. The Auto-Referee engine operates with millimeter precision, detecting faults and line calls automatically. Fair play is guaranteed.",
    label: "Auto-Referee"
  },
  // -- SUPER APP FEATURES START --
  {
    id: 'chat', // Target Section
    script: "Global Ranking. Democratizing the sport. Earn points locally, rise globally. The first truly meritocratic world tour.",
    label: "App: Global Ranking"
  },
  {
    id: 'chat',
    script: "FastPad Booking. Instant court reservations with split payments. Unlock court doors automatically with your phone.",
    label: "App: FastPad Booking"
  },
  {
    id: 'chat',
    script: "Pro Analyzer. Deep learning analysis of your technique. Compare your swing signature against top pros.",
    label: "App: Pro Analyzer"
  },
  {
    id: 'chat',
    script: "Paddy Chat. Text-based tactical advice from Paddy, your personal AI coach trained on your play style.",
    label: "App: Paddy Chat"
  },
  {
    id: 'chat',
    script: "Paddy Voice. Hands-free ecosystem assistant. Say things like, 'Hey Paddy, book a court', or, 'Analyze my last set'.",
    label: "App: Paddy Voice"
  },
  {
    id: 'chat',
    script: "Global Passport. Universal player identity. Verified stats, NFT trophy cabinet, and on-chain match history.",
    label: "App: Global Passport"
  },
  {
    id: 'chat',
    script: "PadWallet. Manage PAD tokens, pay for court time, and collect NFT trophies for tournament wins.",
    label: "App: PadWallet"
  },
  {
    id: 'chat',
    script: "AI Matchmaking. Geo-location based opponent finding. Filters by skill level, play style, and availability.",
    label: "App: AI Matchmaking"
  },
  // -- SUPER APP FEATURES END --
  {
    id: 'analytics',
    script: "Deep data intelligence. We turn physical effort into over 5,000 data points per match, giving you professional-level insights to improve your game.",
    label: "Performance Data"
  },
  {
    id: 'ecosystem',
    script: "A complete universe. From hardware to nutrition, tournaments to tokens. Everything is connected in one global platform.",
    label: "The Ecosystem"
  },
  {
    id: 'outro',
    script: "The revolution is here. Join us in building the future of sports. PadWorld is ready for global deployment.",
    label: "Conclusion"
  }
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  
  // Tour State
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [isTourExpanded, setIsTourExpanded] = useState(false);
  
  // Podcast State
  const [podcastState, setPodcastState] = useState<'IDLE' | 'CHECKING_FILE' | 'GENERATING_SCRIPT' | 'GENERATING_AUDIO' | 'PLAYING_GENERATED' | 'PLAYING_STATIC'>('IDLE');
  const [podcastAudioSource, setPodcastAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [staticPodcastAudio, setStaticPodcastAudio] = useState<HTMLAudioElement | null>(null);
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState<Blob | null>(null);

  // Audio State
  const { muted, toggleMute } = useBackgroundMusic(appState === AppState.EXPERIENCE);

  // Refs for State Consistency in Async Callbacks
  const tourActiveRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    hero: useRef(null),
    court: useRef(null),
    vision: useRef(null),
    referee: useRef(null),
    chat: useRef(null),
    analytics: useRef(null),
    ecosystem: useRef(null),
    outro: useRef(null)
  };

  const handleAuthenticated = () => {
    setAppState(AppState.LOADING);
  };

  const handleLoadingComplete = () => {
    setAppState(AppState.EXPERIENCE);
  };

  // --- PODCAST LOGIC ---
  const stopPodcast = () => {
    // Stop Generated Audio
    if (podcastAudioSource) {
        try { podcastAudioSource.stop(); } catch(e) {}
        setPodcastAudioSource(null);
    }
    // Stop Static File Audio
    if (staticPodcastAudio) {
        staticPodcastAudio.pause();
        staticPodcastAudio.currentTime = 0;
        setStaticPodcastAudio(null);
    }
    setPodcastState('IDLE');
  };

  const downloadGeneratedPodcast = () => {
      if (!generatedAudioBlob) return;
      const url = URL.createObjectURL(generatedAudioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'padworld_podcast.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const startPodcast = async () => {
      // If already playing, stop
      if (podcastState === 'PLAYING_GENERATED' || podcastState === 'PLAYING_STATIC') {
          stopPodcast();
          return;
      }

      setPodcastState('CHECKING_FILE');

      // 1. Try to fetch the static file first (NotebookLM export)
      try {
          const response = await fetch(PODCAST_URL, { method: 'HEAD' });
          if (response.ok) {
              const audio = new Audio(PODCAST_URL);
              audio.volume = 1.0;
              audio.onended = () => {
                  setPodcastState('IDLE');
                  setStaticPodcastAudio(null);
              };
              audio.play();
              setStaticPodcastAudio(audio);
              setPodcastState('PLAYING_STATIC');
              return;
          }
      } catch (e) {
          console.log("Static podcast file not found, falling back to AI generation.");
      }

      // 2. Fallback: Generate AI Podcast
      setPodcastState('GENERATING_SCRIPT');
      
      try {
          // A. Generate Script
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const scriptPrompt = `
            Create a short, high-energy 60-second podcast script between two hosts, Alex (Tech Enthusiast) and Sam (Sports Analyst), summarizing the "PadWorld" investment deck.
            
            Key points to cover:
            1. PadWorld is a decentralized Padel sports ecosystem powered by AI.
            2. Features: Smart Courts with pressure floors, Auto-Referee system (no more arguments!), and 'Paddy' the AI coach.
            3. Business: Tokenized ecosystem (PadToken) and global franchise model.
            
            Format the output strictly as a conversation like:
            Alex: Text
            Sam: Text
            
            Keep it punchy, excited, and professional.
          `;
          
          const scriptResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: scriptPrompt,
          });

          const scriptText = scriptResponse.text;
          if (!scriptText) throw new Error("Failed to generate script");

          setPodcastState('GENERATING_AUDIO');

          // B. Generate Multi-Speaker Audio
          const audioResponse = await ai.models.generateContent({
              model: "gemini-2.5-flash-preview-tts",
              contents: [{ parts: [{ text: scriptText }] }],
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                      multiSpeakerVoiceConfig: {
                          speakerVoiceConfigs: [
                              {
                                  speaker: 'Alex',
                                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
                              },
                              {
                                  speaker: 'Sam',
                                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                              }
                          ]
                      }
                  }
              }
          });

          const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!audioData) throw new Error("Failed to generate audio");

          // C. Play Audio
          if (!audioContextRef.current) {
             audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          if (audioContextRef.current.state === 'suspended') {
             await audioContextRef.current.resume();
          }

          const audioBytes = base64ToUint8Array(audioData);
          
          // Save Blob for Download (Simple WAV wrapper)
          const wavHeader = new ArrayBuffer(44);
          const view = new DataView(wavHeader);
          const pcmData = audioBytes;
          const numChannels = 1;
          const sampleRate = 24000;
          const bitsPerSample = 16;
          const fileLength = pcmData.length + 44 - 8;
          
          writeString(view, 0, 'RIFF');
          view.setUint32(4, fileLength, true);
          writeString(view, 8, 'WAVE');
          writeString(view, 12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, numChannels, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
          view.setUint16(32, numChannels * (bitsPerSample / 8), true);
          view.setUint16(34, bitsPerSample, true);
          writeString(view, 36, 'data');
          view.setUint32(40, pcmData.length, true);

          const wavBlob = new Blob([wavHeader, pcmData], { type: 'audio/wav' });
          setGeneratedAudioBlob(wavBlob);

          // Prepare AudioContext Buffer
          const buffer = audioContextRef.current.createBuffer(1, audioBytes.length / 2, 24000);
          const channelData = buffer.getChannelData(0);
          const dataView = new DataView(audioBytes.buffer);
          for (let i = 0; i < audioBytes.length / 2; i++) {
              channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
          }

          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          
          source.onended = () => {
              setPodcastState('IDLE');
              setPodcastAudioSource(null);
          };

          source.start();
          setPodcastAudioSource(source);
          setPodcastState('PLAYING_GENERATED');

      } catch (error) {
          console.error("Podcast Error:", error);
          setPodcastState('IDLE');
      }
  };

  function writeString(view: DataView, offset: number, string: string) {
      for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
      }
  }

  // --- TOUR LOGIC ---
  const stopTour = () => {
    tourActiveRef.current = false;
    setTourActive(false);
    setIsPlayingAudio(false);
    setIsGeneratingAudio(false);
    setSubtitle('');
    setIsTourExpanded(false);
    
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch(e) {}
      activeSourceRef.current = null;
    }
    
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }
  };

  const playStep = async (index: number) => {
    if (!tourActiveRef.current) return;

    if (index >= TOUR_STEPS.length) {
      stopTour();
      return;
    }

    setTourStepIndex(index);
    const step = TOUR_STEPS[index];
    
    // 1. Scroll to Section
    if (sectionRefs[step.id]?.current) {
      sectionRefs[step.id].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setSubtitle(step.script);
    setIsGeneratingAudio(true);

    try {
      // 2. Initialize Audio Context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 3. Generate Audio via Gemini TTS
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: step.script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } // Updated Voice to Fenrir
          }
        }
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      // If stopped while generating
      if (!tourActiveRef.current) return;

      if (!audioData) throw new Error("No audio data received");

      // 4. Decode and Play
      const audioBytes = base64ToUint8Array(audioData);
      
      // Gemini TTS output is Raw PCM 24kHz Mono Int16
      const buffer = audioContextRef.current.createBuffer(1, audioBytes.length / 2, 24000);
      const channelData = buffer.getChannelData(0);
      const dataView = new DataView(audioBytes.buffer);
      for (let i = 0; i < audioBytes.length / 2; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      setIsGeneratingAudio(false);
      setIsPlayingAudio(true);
      
      activeSourceRef.current = source;
      source.start();

      source.onended = () => {
        setIsPlayingAudio(false);
        if (tourActiveRef.current) {
            timeoutRef.current = setTimeout(() => {
               playStep(index + 1);
            }, 1000);
        }
      };

    } catch (e) {
      console.error("Tour Error:", e);
      setIsGeneratingAudio(false);
      // Skip to next if error
      if (tourActiveRef.current) {
          timeoutRef.current = setTimeout(() => {
            playStep(index + 1);
          }, 2000);
      }
    }
  };

  const startTour = () => {
    // If podcast is playing, stop it
    if (podcastState.includes('PLAYING')) stopPodcast();
    
    tourActiveRef.current = true;
    setTourActive(true);
    playStep(0);
  };

  // Helper to determine active app feature during tour
  const getActiveAppFeatureIndex = () => {
      // The app tour starts at index 4 and has 8 steps (indices 4 to 11)
      if (tourActive && tourStepIndex >= 4 && tourStepIndex <= 11) {
          return tourStepIndex - 4;
      }
      return null;
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-neon-lime selection:text-black overflow-x-hidden">
      <Cursor />
      
      {/* Cinematic Film Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <AnimatePresence mode="wait">
        {appState === AppState.AUTH && (
          <motion.div key="auth" exit={{ opacity: 0 }}>
            <AuthScreen onAuthenticated={handleAuthenticated} />
          </motion.div>
        )}

        {appState === AppState.LOADING && (
          <motion.div key="loading" exit={{ opacity: 0 }}>
             <LoadingSequence onComplete={handleLoadingComplete} />
          </motion.div>
        )}

        {appState === AppState.EXPERIENCE && (
          <motion.div 
            key="experience" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="relative"
          >
             {/* Deck Header - Fixed to match PDF Page 2 Top Bar */}
             <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5 py-6 px-6 md:px-12 flex justify-between items-center transition-all duration-500">
                {/* Logo */}
                <div className="flex items-center">
                  <svg className="h-8 w-auto" viewBox="0 0 247 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.6592 9.00219C23.9399 9.00226 28.1644 13.2771 28.1644 18.5075C28.1644 22.9332 25.0462 26.856 20.721 27.8116L6.33685 31.2314V46.6435H0V9.00219H18.6592ZM169.028 7.89989C177.421 7.89997 184.243 14.7224 184.244 23.1152C184.244 31.5082 177.421 38.3311 169.028 38.3311C160.635 38.3311 153.812 31.5082 153.812 23.1152C153.812 14.7223 160.635 7.89989 169.028 7.89989ZM110.719 24.5793C110.719 28.3155 113.751 31.3478 117.433 31.3479C121.169 31.3479 124.202 28.3156 124.202 24.5793V9.03876H131.024V17.2693C131.024 21.0055 134.057 24.0379 137.793 24.0379C141.529 24.0379 144.561 21.0055 144.561 17.2693V9.03876H151.384V17.2693C151.384 24.7418 145.265 30.8606 137.793 30.8606C135.085 30.8606 132.54 30.0485 130.429 28.6406C128.696 34.1637 123.552 38.1706 117.433 38.1706C109.961 38.1706 103.896 32.0518 103.896 24.5793V9.03876H110.719V24.5793ZM56.3292 37.1965H37.6702C32.3893 37.1965 28.1648 32.9212 28.1648 27.6907C28.1648 23.265 31.2831 19.3422 35.6083 18.3866L49.9919 15.1705L31.2999 15.2523V9.04019H56.3292V37.1965ZM87.7986 37.1965H69.1396C63.8587 37.1965 59.6342 32.9212 59.6342 27.6907C59.6342 23.265 62.7524 19.3422 67.0779 18.3866L81.4621 14.9668V0H87.7986V37.1965ZM246.09 37.1965H227.431C222.15 37.1965 217.926 32.9212 217.926 27.6907C217.926 23.265 221.044 19.3422 225.369 18.3866L239.753 14.9668V0.00824736H246.09V37.1965ZM204.821 15.8629H201.41C197.565 15.8629 194.479 18.9495 194.479 22.7939V37.1921H187.656V22.7939L194.479 10.936C196.482 9.74475 198.865 9.04056 201.41 9.04056H204.821V15.8629ZM214.785 37.1917H207.962V0.00932311H214.785V37.1917ZM169.028 14.7223C164.371 14.7223 160.635 18.4586 160.635 23.1152C160.635 27.7178 164.371 31.5085 169.028 31.5085C173.631 31.5085 177.421 27.7178 177.421 23.1152C177.421 18.4586 173.631 14.7223 169.028 14.7223ZM36.9659 24.5725C35.5074 24.8743 34.5017 26.182 34.5017 27.6907C34.5017 29.451 35.9099 30.8592 37.6702 30.8592H49.9919V21.4547L36.9659 24.5725ZM68.4357 24.5725C66.9773 24.8743 65.9712 26.182 65.9712 27.6907C65.9712 29.4509 67.3793 30.8591 69.1396 30.8592H81.4621V21.4547L68.4357 24.5725ZM226.727 24.5725C225.269 24.8743 224.263 26.182 224.263 27.6907C224.263 29.4509 225.671 30.8591 227.431 30.8592H239.753V21.4547L226.727 24.5725ZM6.33685 24.7439L19.3631 21.6257C20.8215 21.3239 21.8276 20.0162 21.8276 18.5075C21.8276 16.7473 20.4193 15.3391 18.6592 15.339H6.33685V24.7439Z" fill="white"/>
                  </svg>
                </div>

                {/* Deck Meta Data */}
                <div className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-widest text-gray-400 uppercase">
                  <div className="flex items-center gap-4">
                     <span className="flex items-center gap-2"><span className="text-neon-blue">🌐</span> DUBAI HQ</span>
                     <span className="text-gray-700">//</span>
                     <span>EST. 2025</span>
                  </div>
                  <div className="h-4 w-[1px] bg-gray-700"></div>
                  
                  {/* Podcast Button */}
                  <button 
                     onClick={startPodcast}
                     disabled={podcastState === 'GENERATING_SCRIPT' || podcastState === 'GENERATING_AUDIO' || podcastState === 'CHECKING_FILE'}
                     className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${podcastState.includes('PLAYING') ? 'border-neon-blue text-neon-blue bg-neon-blue/10' : 'border-gray-700 text-gray-400 hover:border-white hover:text-white'}`}
                  >
                      {podcastState === 'GENERATING_SCRIPT' || podcastState === 'GENERATING_AUDIO' || podcastState === 'CHECKING_FILE' ? (
                          <Loader2 size={12} className="animate-spin" />
                      ) : (
                          <Headphones size={12} />
                      )}
                      <span className="font-bold">
                        {podcastState === 'IDLE' ? 'NEURAL BRIEFING' : podcastState.includes('PLAYING') ? 'PLAYING...' : 'INITIALIZING...'}
                      </span>
                  </button>

                  <div className="h-4 w-[1px] bg-gray-700"></div>

                  {/* Tour Button */}
                  <button 
                    onClick={tourActive ? stopTour : startTour}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${tourActive ? 'border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white' : 'border-neon-lime text-neon-lime bg-neon-lime/10 hover:bg-neon-lime hover:text-black'}`}
                  >
                     {tourActive ? <Square size={10} fill="currentColor" /> : <Play size={12} />}
                     <span className="font-bold">{tourActive ? 'STOP TOUR' : 'START TOUR'}</span>
                  </button>
                </div>
             </nav>

             <main>
                <div ref={sectionRefs.hero}>
                   <Hero />
                </div>
                
                <div ref={sectionRefs.court}>
                   <SectionDivider 
                      title="Smart Court" 
                      subtitle="Infrastructure" 
                      fallbackImage="https://images.unsplash.com/photo-1554068865-2415f90d23bb?q=80&w=2000&auto=format&fit=crop"
                   />
                   <SmartCourt demoMode={tourActive && TOUR_STEPS[tourStepIndex].id === 'court'} />
                </div>

                <div ref={sectionRefs.vision}>
                   <SectionDivider 
                      title="AI Vision" 
                      subtitle="Computer Vision" 
                      fallbackImage="https://images.unsplash.com/photo-1639322537228-ad7110917e5d?q=80&w=2000&auto=format&fit=crop" 
                      align="right"
                   />
                   <AIVision />
                </div>

                <div ref={sectionRefs.referee}>
                   <SectionDivider 
                      title="Auto Referee" 
                      subtitle="Precision" 
                      fallbackImage="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2000&auto=format&fit=crop"
                      align="left"
                   />
                   <AutoReferee demoMode={tourActive && TOUR_STEPS[tourStepIndex].id === 'referee'} />
                </div>

                <div ref={sectionRefs.chat}>
                   <SectionDivider 
                      title="Super App" 
                      subtitle="Ecosystem" 
                      fallbackImage="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2000&auto=format&fit=crop"
                   />
                   <PadChat forcedFeatureIndex={getActiveAppFeatureIndex()} />
                </div>

                <div ref={sectionRefs.analytics}>
                   <SectionDivider 
                      title="Analytics" 
                      subtitle="Deep Data" 
                      fallbackImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop"
                      align="right"
                   />
                   <Analytics />
                </div>

                <div ref={sectionRefs.ecosystem}>
                   <SectionDivider 
                      title="The Universe" 
                      subtitle="Connectivity" 
                      fallbackImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop"
                   />
                   <Ecosystem />
                </div>
                
                <div ref={sectionRefs.outro} className="py-24 bg-black border-t border-white/10 flex flex-col items-center justify-center text-center">
                    <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Join the Revolution</h2>
                    <button className="px-8 py-4 bg-neon-lime text-black font-mono font-bold uppercase tracking-widest hover:bg-white transition-colors">
                        Invest Now
                    </button>
                    <p className="mt-12 text-gray-600 font-mono text-xs">PADWORLD INDUSTRIES © 2025 • DUBAI • TOKYO • NEW YORK</p>
                </div>
             </main>
             
             {/* Floating Audio Toggle */}
             <button 
                onClick={toggleMute}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
             >
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>

             <AnimatePresence>
                {tourActive && subtitle && (
                   <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="fixed bottom-12 left-0 right-0 z-40 flex justify-center px-6 pointer-events-none"
                   >
                      <div className="bg-black/80 backdrop-blur-md border border-neon-lime/30 px-8 py-6 rounded-2xl max-w-2xl text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                          <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                              <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest">Live Presentation</span>
                          </div>
                          <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                            "{subtitle}"
                          </p>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;