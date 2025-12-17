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
import BootSequence from './components/BootSequence';
import { motion, AnimatePresence } from 'framer-motion';
import { AppState } from './types';
import { ArrowUpRight, Activity, Play, Square, Volume2, VolumeX, Loader2, Sparkles, StopCircle, Mic, X, MessageSquare, ChevronDown, Headphones, Radio, Download, Zap, Power, ExternalLink } from 'lucide-react';
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
             <BootSequence onComplete={handleLoadingComplete} />
          </motion.div>
        )}
        
        {appState === AppState.EXPERIENCE && (
          <motion.div key="experience" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* --- GLOBAL TOP NAVIGATION --- */}
            <nav className="fixed top-0 left-0 w-full z-40 px-6 py-6 flex justify-between items-center pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
              {/* Left: Logo (Clickable) */}
              <div className="pointer-events-auto">
                 <svg width="140" height="26" viewBox="0 0 247 47" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white fill-current">
                    <path d="M18.6592 9.00219C23.9399 9.00226 28.1644 13.2771 28.1644 18.5075C28.1644 22.9332 25.0462 26.856 20.721 27.8116L6.33685 31.2314V46.6435H0V9.00219H18.6592ZM169.028 7.89989C177.421 7.89997 184.243 14.7224 184.244 23.1152C184.244 31.5082 177.421 38.3311 169.028 38.3311C160.635 38.3311 153.812 31.5082 153.812 23.1152C153.812 14.7223 160.635 7.89989 169.028 7.89989ZM110.719 24.5793C110.719 28.3155 113.751 31.3478 117.433 31.3479C121.169 31.3479 124.202 28.3156 124.202 24.5793V9.03876H131.024V17.2693C131.024 21.0055 134.057 24.0379 137.793 24.0379C141.529 24.0379 144.561 21.0055 144.561 17.2693V9.03876H151.384V17.2693C151.384 24.7418 145.265 30.8606 137.793 30.8606C135.085 30.8606 132.54 30.0485 130.429 28.6406C128.696 34.1637 123.552 38.1706 117.433 38.1706C109.961 38.1706 103.896 32.0518 103.896 24.5793V9.03876H110.719V24.5793ZM56.3292 37.1965H37.6702C32.3893 37.1965 28.1648 32.9212 28.1648 27.6907C28.1648 23.265 31.2831 19.3422 35.6083 18.3866L49.9919 15.1705L31.2999 15.2523V9.04019H56.3292V37.1965ZM87.7986 37.1965H69.1396C63.8587 37.1965 59.6342 32.9212 59.6342 27.6907C59.6342 23.265 62.7524 19.3422 67.0779 18.3866L81.4621 14.9668V0H87.7986V37.1965ZM246.09 37.1965H227.431C222.15 37.1965 217.926 32.9212 217.926 27.6907C217.926 23.265 221.044 19.3422 225.369 18.3866L239.753 14.9668V0.00824736H246.09V37.1965ZM204.821 15.8629H201.41C197.565 15.8629 194.479 18.9495 194.479 22.7939V37.1921H187.656V22.7939L194.479 10.936C196.482 9.74475 198.865 9.04056 201.41 9.04056H204.821V15.8629ZM214.785 37.1917H207.962V0.00932311H214.785V37.1917ZM169.028 14.7223C164.371 14.7223 160.635 18.4586 160.635 23.1152C160.635 27.7178 164.371 31.5085 169.028 31.5085C173.631 31.5085 177.421 27.7178 177.421 23.1152C177.421 18.4586 173.631 14.7223 169.028 14.7223ZM36.9659 24.5725C35.5074 24.8743 34.5017 26.182 34.5017 27.6907C34.5017 29.451 35.9099 30.8592 37.6702 30.8592H49.9919V21.4547L36.9659 24.5725ZM68.4357 24.5725C66.9773 24.8743 65.9712 26.182 65.9712 27.6907C65.9712 29.4509 67.3793 30.8591 69.1396 30.8592H81.4621V21.4547L68.4357 24.5725ZM226.727 24.5725C225.269 24.8743 224.263 26.182 224.263 27.6907C224.263 29.4509 225.671 30.8591 227.431 30.8592H239.753V21.4547L226.727 24.5725ZM6.33685 24.7439L19.3631 21.6257C20.8215 21.3239 21.8276 20.0162 21.8276 18.5075C21.8276 16.7473 20.4193 15.3391 18.6592 15.339H6.33685V24.7439Z" fill="currentColor"/>
                 </svg>
              </div>
              
              {/* Right: Menu Items (Clickable Container) */}
              <div className="hidden md:flex items-center gap-6 text-[10px] font-mono tracking-widest text-gray-400 uppercase pointer-events-auto">
                 
                 {/* 1. AUTO Button (Toggle State) */}
                 <button 
                    onClick={tourActive ? stopTour : startTour}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all backdrop-blur-sm ${
                        tourActive 
                            ? 'bg-neon-lime/10 border-neon-lime text-neon-lime shadow-[0_0_15px_rgba(172,255,1,0.4)]' 
                            : 'bg-black/40 border-white/20 text-gray-400 hover:border-white hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    AUTO
                 </button>

                 {/* Vertical Separator Line */}
                 <div className="w-px h-3 bg-gray-600" />

                 {/* 2. AUDIO Button */}
                 <button onClick={toggleMute} className="flex items-center gap-3 hover:text-white transition-colors group">
                    {muted ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-gray-500" />}
                    <span className={`group-hover:text-neon-lime transition-colors ${!muted ? 'text-neon-lime' : ''}`}>
                      AUDIO {muted ? 'OFF' : 'ON'}
                    </span>
                 </button>

                 <div className="w-px h-3 bg-gray-600 mx-2" />

                 {/* 3. Location Indicator with Green Dot */}
                 <div className="flex items-center gap-2">
                    <span className="text-neon-lime animate-pulse">●</span> DUBAI HQ
                 </div>

                 <span>//</span>

                 {/* 4. Date/Est */}
                 <div>EST. 2025</div>

                 <div className="w-px h-3 bg-gray-600 mx-2" />

                 {/* 5. Outbound Link */}
                 <a href="https://padworld.global" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neon-lime transition-colors flex items-center gap-1">
                    VISIT PADWORLD.GLOBAL <ArrowUpRight size={10} />
                 </a>
              </div>
            </nav>

            {/* --- GLOBAL BOTTOM HUD --- */}
            <div className="fixed bottom-0 left-0 w-full z-40 px-6 py-6 flex justify-between items-end pointer-events-none bg-gradient-to-t from-black/80 to-transparent">
               {/* Left: Confidential Tag */}
               <div className="flex items-center gap-3 pointer-events-auto">
                  {/* The Green Square/Dot */}
                  <div className="w-1.5 h-1.5 bg-neon-lime rounded-full shadow-[0_0_10px_#ACFF01]" />
                  
                  {/* The Text */}
                  <span className="text-[10px] font-mono tracking-[0.2em] text-gray-400 uppercase">
                     Confidential
                  </span>
               </div>

               {/* Right: Tagline and Pagination */}
               <div className="flex items-center gap-6 pointer-events-auto">
                  {/* Tagline (Hidden on mobile) */}
                  <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase hidden md:block">
                     The Future of Sport
                  </span>
                  
                  {/* Horizontal Line Separator */}
                  <div className="w-16 h-px bg-gray-700 hidden md:block" />
                  
                  {/* Page Counter */}
                  <div className="font-mono text-sm font-bold text-neon-lime">
                     01 <span className="text-gray-600">/ 12</span>
                  </div>
               </div>
            </div>

            {/* AUDIO CONTROL FAB (PODCAST ONLY) */}
            <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
               
               {/* Podcast Player */}
               <AnimatePresence>
                   {(podcastState !== 'IDLE') && (
                       <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="bg-black/90 border border-white/20 p-3 rounded-xl backdrop-blur flex items-center gap-3 mb-2 shadow-xl"
                       >
                           <div className="w-8 h-8 rounded-full bg-neon-blue flex items-center justify-center animate-pulse">
                              <Radio size={14} className="text-black"/>
                           </div>
                           <div className="flex flex-col">
                               <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
                                   {podcastState === 'CHECKING_FILE' && "Locating..."}
                                   {podcastState === 'GENERATING_SCRIPT' && "AI Scripting..."}
                                   {podcastState === 'GENERATING_AUDIO' && "Synthesizing..."}
                                   {podcastState.includes('PLAYING') && "Now Playing"}
                               </span>
                               <span className="text-xs font-bold text-white">Investment Brief</span>
                           </div>
                           <div className="flex gap-2">
                               {podcastState === 'PLAYING_GENERATED' && (
                                   <button onClick={downloadGeneratedPodcast} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><Download size={14} /></button>
                               )}
                               <button onClick={stopPodcast} className="p-1.5 hover:bg-white/10 rounded-full transition-colors"><StopCircle size={14} className="text-red-500" /></button>
                           </div>
                       </motion.div>
                   )}
               </AnimatePresence>

               {/* Only show Podcast button here, others moved to top nav */}
               <button 
                   onClick={startPodcast}
                   className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg ${podcastState !== 'IDLE' ? 'bg-neon-blue text-black border-neon-blue' : 'bg-black/80 text-white border-white/20 hover:border-white'}`}
                   title="Play AI Podcast"
               >
                   {podcastState.includes('GENERATING') ? (
                       <Loader2 size={18} className="animate-spin" /> 
                   ) : (
                       <Headphones size={18} />
                   )}
               </button>
            </div>

            {/* TOUR OVERLAY */}
            <AnimatePresence>
                {tourActive && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-20 left-0 right-0 p-6 z-40 flex justify-center pointer-events-none"
                    >
                        <div className="bg-black/90 border border-neon-lime/30 p-4 md:p-6 rounded-2xl backdrop-blur-md max-w-2xl w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden">
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
                                <motion.div 
                                    className="h-full bg-neon-lime"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((tourStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                                />
                            </div>

                            <div className="flex items-start gap-4 mt-2">
                                <div className="hidden md:flex w-12 h-12 rounded-full bg-neon-lime/10 border border-neon-lime/30 items-center justify-center flex-shrink-0">
                                    {isGeneratingAudio ? (
                                        <Loader2 className="text-neon-lime animate-spin" size={20} />
                                    ) : (
                                        <div className="flex gap-0.5 items-end h-4">
                                            {[...Array(3)].map((_,i) => (
                                                <motion.div 
                                                    key={i} 
                                                    className="w-1 bg-neon-lime"
                                                    animate={isPlayingAudio ? { height: [4, 16, 4] } : { height: 4 }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-mono text-neon-lime uppercase tracking-widest">
                                            {TOUR_STEPS[tourStepIndex].label}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                {tourStepIndex + 1} / {TOUR_STEPS.length}
                                            </span>
                                            <button 
                                                onClick={() => setIsTourExpanded(!isTourExpanded)}
                                                className="md:hidden text-gray-500"
                                            >
                                                {isTourExpanded ? <ChevronDown size={14} /> : <ArrowUpRight size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className={`transition-all duration-300 overflow-hidden ${isTourExpanded ? 'max-h-40' : 'max-h-24 md:max-h-none'}`}>
                                        <p className="text-sm md:text-lg text-white font-medium leading-relaxed">
                                            {subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    onClick={() => playStep(Math.max(0, tourStepIndex - 1))}
                                    className="px-3 py-1.5 rounded border border-white/10 text-xs text-gray-300 hover:bg-white/10"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={() => playStep(tourStepIndex + 1)}
                                    className="px-3 py-1.5 rounded bg-white text-black text-xs font-bold hover:bg-gray-200 flex items-center gap-1"
                                >
                                    Next <ArrowUpRight size={12} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN SECTIONS */}
            <div ref={sectionRefs.hero} id="hero">
                <Hero />
            </div>
            
            <SectionDivider 
                localImage="section_1_court.jpg"
                fallbackImage="https://images.unsplash.com/photo-1599474924187-334a405be655?q=80&w=1200" 
                title="The Arena" 
                subtitle="Smart Infrastructure"
                slogan="INTELLIGENT SURFACE"
            />
            
            <div ref={sectionRefs.court} id="court">
                <SmartCourt demoMode={tourActive && tourStepIndex === 1} />
            </div>

            <SectionDivider 
                localImage="section_2_vision.jpg"
                fallbackImage="https://images.unsplash.com/photo-1530915512336-f439ca9959dc?q=80&w=1200"
                title="Optical Engine" 
                subtitle="Computer Vision"
                align="left"
                slogan="ZERO LATENCY"
            />

            <div ref={sectionRefs.vision} id="vision">
                <AIVision />
            </div>

            <SectionDivider 
                localImage="section_3_referee.jpg"
                fallbackImage="https://images.unsplash.com/photo-1554068865-2415f90d23bb?q=80&w=1200"
                title="Fair Play" 
                subtitle="Auto-Referee System"
                align="right"
                slogan="PRECISION"
            />

            <div ref={sectionRefs.referee} id="referee">
                <AutoReferee demoMode={tourActive && tourStepIndex === 3} />
            </div>

            <SectionDivider 
                 localImage="section_4_chat.jpg"
                 fallbackImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200"
                 title="Super App"
                 subtitle="The Ecosystem"
                 slogan="CONNECTED"
            />

            <div ref={sectionRefs.chat} id="chat">
                <PadChat forcedFeatureIndex={getActiveAppFeatureIndex()} />
            </div>

            <SectionDivider 
                 localImage="section_5_analytics.jpg"
                 fallbackImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200"
                 title="Deep Data"
                 subtitle="Analytics"
                 align="left"
                 slogan="INSIGHTS"
            />

            <div ref={sectionRefs.analytics} id="analytics">
                <Analytics />
            </div>

            <div ref={sectionRefs.ecosystem} id="ecosystem">
                <Ecosystem />
            </div>
            
            {/* FOOTER */}
            <div ref={sectionRefs.outro} className="relative h-[100vh] flex flex-col items-center justify-center bg-black overflow-hidden border-t border-white/5" id="outro">
                {/* Clean Background - Subtle radial glow only */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)]"></div>
                <div className="absolute inset-0 bg-black/80"></div>

                <div className="relative z-10 w-full flex flex-col items-center justify-center h-full">
                    {/* The One-Liner Headline */}
                    <motion.h2
                        initial={{ y: 100, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="font-display font-black text-[12vw] leading-none tracking-tighter text-white mix-blend-difference whitespace-nowrap z-20"
                    >
                        ENTER THE ARENA
                    </motion.h2>

                    {/* NEW: Animated Impact Text */}
                    <motion.div
                        initial={{ opacity: 0, letterSpacing: '0em', y: 20 }}
                        whileInView={{ opacity: 1, letterSpacing: '0.3em', y: 0 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        className="mt-2 md:mt-4 z-20"
                    >
                        <motion.span 
                            className="text-neon-lime font-mono font-bold text-sm md:text-2xl uppercase block text-center"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            JOIN THE REVOLUTION
                        </motion.span>
                    </motion.div>

                    {/* The Reflection Effect */}
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.15 }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        className="font-display font-black text-[12vw] leading-none tracking-tighter text-neon-lime mix-blend-difference whitespace-nowrap scale-y-[-1] absolute bottom-[15vh] md:bottom-[10vh] blur-sm mask-image-fade pointer-events-none select-none"
                    >
                        ENTER THE ARENA
                    </motion.h2>

                    {/* Minimalist Text Links (No Icons) */}
                    <div className="absolute bottom-16 md:bottom-24 flex gap-16 text-center z-20">
                         <button className="text-white font-mono font-bold text-xs uppercase tracking-[0.3em] hover:text-neon-lime transition-colors relative group">
                            Initialize Partnership
                            <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-neon-lime scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                         </button>
                         
                         <button className="text-gray-400 font-mono font-bold text-xs uppercase tracking-[0.3em] hover:text-white transition-colors relative group">
                            Download Brief
                            <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                         </button>
                    </div>

                    {/* Footer Meta */}
                    <div className="absolute bottom-6 left-0 right-0 text-center z-10 mb-8">
                        <div className="text-[10px] font-mono text-gray-800 uppercase tracking-widest">
                            PadWorld Industries © 2024
                        </div>
                    </div>
                </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;