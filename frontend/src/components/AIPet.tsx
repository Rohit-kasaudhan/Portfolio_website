import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  isLink?: boolean;
  linkUrl?: string;
}

type Mood = 'idle' | 'happy' | 'laughing' | 'dancing' | 'talking' | 'dizzy';
type TiltDirection = 'left' | 'right' | 'none';

export default function AIPet() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Pika_Pika ,Hlo! I am Pikachu, Rohit's customized assistant! ⚡ Drag me anywhere or click me to chat!"
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [mood, setMood] = useState<Mood>('idle');
  const [tilt, setTilt] = useState<TiltDirection>('none');
  const [inputVal, setInputVal] = useState<string>('');
  
  // Pikachu special actions
  const [pikaSpeech, setPikaSpeech] = useState<string>('');
  const [isSparking, setIsSparking] = useState<boolean>(false);
  
  // Mute audio controls
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pikachu_muted') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('pikachu_muted', String(isMuted));
  }, [isMuted]);

  // Pokéball states
  const [petState, setPetState] = useState<'in_ball' | 'rolling' | 'opening' | 'jumping' | 'landing' | 'active'>('in_ball');
  const [ballAction, setBallAction] = useState<'idle' | 'wiggle' | 'bounce' | 'roll'>('idle');
  const [showScreenFlash, setShowScreenFlash] = useState<boolean>(false);
  const [isRecallTransition, setIsRecallTransition] = useState<boolean>(false);
  const [lightningBolts, setLightningBolts] = useState<{ id: number; top: number; left: number; rotation: number; scale: number }[]>([]);
  const [emergeSparks, setEmergeSparks] = useState<{ id: number; angle: number; speed: number; delay: number }[]>([]);
  const [dustParticles, setDustParticles] = useState<{ id: number; left: number; top: number }[]>([]);
  const [jumpSparks, setJumpSparks] = useState<{ id: number; left: number; top: number }[]>([]);
  const [landingSparks, setLandingSparks] = useState<{ id: number; angle: number; speed: number; delay: number }[]>([]);
  


  // Synthesizes a high-voltage crackling sound
  const playElectricSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(750, audioCtx.currentTime + 0.25);
      
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      // Rapid volume oscillation for electric buzz
      for (let i = 0; i < 5; i++) {
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime + i * 0.04);
        gainNode.gain.setValueAtTime(0.005, audioCtx.currentTime + i * 0.04 + 0.02);
      }
      gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
      setTimeout(() => audioCtx.close(), 400);
    } catch {
      // ignore synth error
    }
  }, [isMuted]);

  // Generate cinematic screen-wide electric arcs
  const triggerLightningFlashes = useCallback(() => {
    let count = 0;
    const interval = setInterval(() => {
      const bolts = Array.from({ length: 3 }).map((_, i) => ({
        id: Math.random() + i,
        top: Math.random() * 70, // % of screen height
        left: Math.random() * 70, // % of screen width
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 1.2
      }));
      setLightningBolts(bolts);
      playElectricSound();
      
      count++;
      if (count > 6) {
        clearInterval(interval);
        setLightningBolts([]);
      }
    }, 90);
  }, [playElectricSound]);

  // Handle Pokéball clicked to open
  const handlePokeballClick = () => {
    if (ballAction !== 'idle') return; // block if already in motion
    if (petState !== 'in_ball') return;
    
    // Stop all random movements and start rolling
    setBallAction('idle');
    setPetState('rolling');
    
    // Generate dust particles during roll
    let dustId = 0;
    let rollTick = 0;
    const dustInterval = setInterval(() => {
      rollTick++;
      const progress = Math.min(1, (rollTick * 40) / 600);
      const rollDist = -(window.innerWidth - 100);
      const currentX = rollDist * progress;
      
      setDustParticles(prev => [
        ...prev,
        {
          id: dustId++,
          left: 30 + currentX + (Math.random() * 16 - 8),
          top: 52 + (Math.random() * 6 - 3)
        }
      ]);
    }, 40);

    // After 600ms (Roll complete) -> transition to 'opening'
    setTimeout(() => {
      clearInterval(dustInterval);
      setPetState('opening');
      
      // Generate emerge sparks
      const sparks = Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        angle: (i / 18) * 360 + (Math.random() * 16 - 8),
        speed: 80 + Math.random() * 100,
        delay: Math.random() * 0.12
      }));
      setEmergeSparks(sparks);
      
      // Trigger lightning flashes
      triggerLightningFlashes();
      
      // Play sound and flash
      setShowScreenFlash(true);
      playPikaSound();

      
      setMood('happy');
      setIsSparking(true);
      setPikaSpeech('Pika-chuuuuuu! ⚡⚡');

      // Clear screen flash overlay after 350ms
      setTimeout(() => {
        setShowScreenFlash(false);
      }, 350);
      
      // After 400ms (Opening complete) -> transition to 'jumping'
      setTimeout(() => {
        setPetState('jumping');
        setEmergeSparks([]); // clear emerge sparks
        
        // Spark trail loop during jump (1000ms)
        let sparkId = 0;
        let jumpTick = 0;
        const sparkInterval = setInterval(() => {
          jumpTick++;
          const progress = Math.min(1, (jumpTick * 30) / 1000);
          
          const rollDist = -(window.innerWidth - 100);
          const x = rollDist + (-rollDist) * progress;
          const y = -180 * (4 * progress * (1 - progress));
          
          setJumpSparks(prev => [
            ...prev,
            {
              id: sparkId++,
              left: 37 + x + (Math.random() * 20 - 10),
              top: 35 + y + (Math.random() * 20 - 10)
            }
          ]);
        }, 30);
        
        // After 1000ms (Jump complete) -> transition to 'landing'
        setTimeout(() => {
          clearInterval(sparkInterval);
          setJumpSparks([]); // clear jump trail sparks
          setPetState('landing');
          
          // Generate landing sparks
          const lSparks = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            angle: (i / 8) * 360 + (Math.random() * 30 - 15),
            speed: 40 + Math.random() * 50,
            delay: Math.random() * 0.08
          }));
          setLandingSparks(lSparks);
          
          // Play a small land sound/crackle
          playElectricSound();
          
          // After 600ms (Landing complete) -> transition to 'active'
          setTimeout(() => {
            setPetState('active');
            setLandingSparks([]);
            setDustParticles([]);
            setIsSparking(false);
            setPikaSpeech('');
            setMood('idle');
          }, 600);
          
        }, 1000);
        
      }, 400);

    }, 600);
  };

  // Handle recalling Pikachu to Pokéball
  const handleRecall = () => {
    if (petState !== 'active' || isRecallTransition) return;
    setIsRecallTransition(true);
    setIsOpen(false);
    setMood('idle');


    // After recall Sink animation finishes (400ms), switch state
    setTimeout(() => {
      setPetState('in_ball');
      setIsRecallTransition(false);
    }, 400);
  };

  // Random Pokéball autonomous movements (bounce, wiggle, roll)
  useEffect(() => {
    if (petState !== 'in_ball') return;

    const runRandomAction = () => {
      const actions: ('wiggle' | 'bounce' | 'roll')[] = ['wiggle', 'bounce', 'roll'];
      const chosen = actions[Math.floor(Math.random() * actions.length)];
      setBallAction(chosen);

      // Reset to idle after the animation duration
      let duration = 800;
      if (chosen === 'roll') duration = 1200;
      if (chosen === 'wiggle') duration = 600;

      setTimeout(() => {
        setBallAction('idle');
      }, duration);
    };

    // Run a random action every 4 seconds
    const interval = setInterval(() => {
      runRandomAction();
    }, 4000);

    return () => clearInterval(interval);
  }, [petState]);
  
  // Floating position states
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth - 80 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight - 80 : 0
  }));

  // Enforce Pokéball position in bottom right when in_ball
  useEffect(() => {
    if (petState === 'in_ball') {
      const resetPosition = () => {
        setPosition({
          x: window.innerWidth - 80,
          y: window.innerHeight - 80
        });
      };
      resetPosition();
      window.addEventListener('resize', resetPosition);
      return () => window.removeEventListener('resize', resetPosition);
    }
  }, [petState]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const clickStartRef = useRef({ x: 0, y: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Post-drag pause states
  const [isDragPaused, setIsDragPaused] = useState<boolean>(false);
  const dragPauseTimeoutRef = useRef<number | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragPauseTimeoutRef.current) {
        clearTimeout(dragPauseTimeoutRef.current);
      }
    };
  }, []);

  // Keep pet inside viewport boundaries on window resize
  useEffect(() => {
    const handleResizeClamping = () => {
      setPosition(prev => {
        const boundedX = Math.max(10, Math.min(window.innerWidth - 80, prev.x));
        const boundedY = Math.max(10, Math.min(window.innerHeight - 80, prev.y));
        return { x: boundedX, y: boundedY };
      });
    };
    window.addEventListener('resize', handleResizeClamping);
    return () => window.removeEventListener('resize', handleResizeClamping);
  }, []);

  // HTML5 Audio playback helper (streams classic Pikachu sound effect)
  const playPikaSound = useCallback(() => {
    if (isMuted) return;
    try {
      const audio = new Audio('/pikachu.mp3');
      audio.volume = 0.35; // Pleasant, non-intrusive volume
      audio.play().catch(() => {
        // Autoplay policy blocker (catches and ignores autoplay blocks before first user interaction)
      });
    } catch {
      // Ignore audio loading errors gracefully
    }
  }, [isMuted]);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show tooltip after 2 seconds, auto-hide after exactly 5 seconds
  useEffect(() => {
    if (isOpen || isDragging || pikaSpeech) return;

    const showTimer = setTimeout(() => {
      setShowTooltip(true);
      
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);

      return () => clearTimeout(hideTimer);
    }, 2000);

    return () => {
      clearTimeout(showTimer);
      setShowTooltip(false);
    };
  }, [isOpen, isDragging, pikaSpeech, petState]);

  // Active smooth wandering around the screen (every 6 seconds, paused on drag-cooldown)
  useEffect(() => {
    const pickNewPosition = () => {
      if (petState === 'active' && mood === 'idle' && !isOpen && !isDragging && !isDragPaused) {
        const randomX = Math.max(60, Math.min(window.innerWidth - 130, Math.random() * (window.innerWidth - 100)));
        const randomY = Math.max(120, Math.min(window.innerHeight - 200, Math.random() * (window.innerHeight - 150)));
        
        setPosition(prev => {
          // Calculate flight direction for tilt rotation
          if (randomX > prev.x + 15) {
            setTilt('right');
          } else if (randomX < prev.x - 15) {
            setTilt('left');
          } else {
            setTilt('none');
          }
          return { x: randomX, y: randomY };
        });

        // Clear tilt when flight transition settles
        setTimeout(() => {
          setTilt('none');
        }, 2500);
      }
    };

    if (petState === 'active') {
      pickNewPosition();
      const interval = setInterval(pickNewPosition, 6000);
      return () => clearInterval(interval);
    }
  }, [mood, isOpen, isDragging, isDragPaused, petState]);

  // Schedule funny random movements autonomously (every 7 seconds)
  useEffect(() => {
    if (petState !== 'active') return;

    const actionInterval = setInterval(() => {
      if (mood === 'idle' && !isDragging) {
        const actions: ('spin' | 'bounce' | 'wiggle' | 'dizzy' | 'thunderbolt' | 'pika-pika')[] = 
          ['spin', 'bounce', 'wiggle', 'dizzy', 'thunderbolt', 'pika-pika'];
        const chosen = actions[Math.floor(Math.random() * actions.length)];

        if (chosen === 'spin') {
          setMood('dancing');
          setTimeout(() => setMood('idle'), 1200);
        } else if (chosen === 'bounce') {
          setMood('happy');
          setTimeout(() => setMood('idle'), 1500);
        } else if (chosen === 'wiggle') {
          setMood('laughing');
          setTimeout(() => setMood('idle'), 1000);
        } else if (chosen === 'dizzy') {
          setMood('dizzy');
          setTimeout(() => setMood('idle'), 1800);
        } else if (chosen === 'thunderbolt') {
          setMood('happy');
          setIsSparking(true);
          setPikaSpeech('Pika-chuuuuuu! ⚡⚡');
          setTimeout(() => {
            setIsSparking(false);
            setPikaSpeech('');
            setMood('idle');
          }, 1800);
        } else if (chosen === 'pika-pika') {
          setMood('happy');
          setPikaSpeech('Pika-Pika! ❤');
          setTimeout(() => {
            setPikaSpeech('');
            setMood('idle');
          }, 1500);
        }
      }
    }, 7000);

    return () => clearInterval(actionInterval);
  }, [mood, isDragging, playPikaSound, petState]);

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setMood('happy');
    setShowTooltip(false);
    
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    clickStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    // Temporarily pause wandering while dragging
    setIsDragPaused(true);
    if (dragPauseTimeoutRef.current) {
      clearTimeout(dragPauseTimeoutRef.current);
      dragPauseTimeoutRef.current = null;
    }
    
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    setMood('happy');
    setShowTooltip(false);
    
    dragStart.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    };
    clickStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    // Temporarily pause wandering while dragging
    setIsDragPaused(true);
    if (dragPauseTimeoutRef.current) {
      clearTimeout(dragPauseTimeoutRef.current);
      dragPauseTimeoutRef.current = null;
    }
    
    // Stop default touch gesture behaviors (scrolling/swiping)
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  // Handle Dragging and Mouse/Touch Up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const nextX = e.clientX - dragStart.current.x;
      const nextY = e.clientY - dragStart.current.y;
      
      // Screen boundaries
      const boundedX = Math.max(10, Math.min(window.innerWidth - 80, nextX));
      const boundedY = Math.max(10, Math.min(window.innerHeight - 80, nextY));
      
      setPosition({ x: boundedX, y: boundedY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      if (!touch) return;
      
      const nextX = touch.clientX - dragStart.current.x;
      const nextY = touch.clientY - dragStart.current.y;
      
      // Screen boundaries
      const boundedX = Math.max(10, Math.min(window.innerWidth - 80, nextX));
      const boundedY = Math.max(10, Math.min(window.innerHeight - 80, nextY));
      
      setPosition({ x: boundedX, y: boundedY });
    };

    const handleDragEnd = (clientX: number, clientY: number) => {
      setIsDragging(false);
      setMood('idle');
      
      // Measure pixel distance to differentiate click from drag
      const distance = Math.hypot(clientX - clickStartRef.current.x, clientY - clickStartRef.current.y);
      if (distance < 6) {
        // Simple click - toggle the chat bubble/console
        setIsOpen(prev => !prev);
        setMood(prev => !prev ? 'idle' : 'talking');
        
        // Clear any drag pause if it's just a click
        setIsDragPaused(false);
        if (dragPauseTimeoutRef.current) {
          clearTimeout(dragPauseTimeoutRef.current);
          dragPauseTimeoutRef.current = null;
        }
      } else {
        // It was a drag! Set a 18-second pause timer where wandering is suspended
        setIsDragPaused(true);
        if (dragPauseTimeoutRef.current) clearTimeout(dragPauseTimeoutRef.current);
        dragPauseTimeoutRef.current = window.setTimeout(() => {
          setIsDragPaused(false);
        }, 18000);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        handleDragEnd(e.clientX, e.clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.changedTouches[0] || e.touches[0];
        const clientX = touch ? touch.clientX : clickStartRef.current.x;
        const clientY = touch ? touch.clientY : clickStartRef.current.y;
        handleDragEnd(clientX, clientY);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, playPikaSound]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isTyping) return;

    // 1. Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: queryText }]);
    setIsTyping(true);
    setMood('talking');
    setInputVal('');

    // 2. Prepare request history
    const chatHistory = messages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text,
    }));

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: queryText,
          history: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Add a placeholder bot response to start streaming into
      setMessages((prev) => [...prev, { sender: 'bot', text: '' }]);
      setIsTyping(false); // Done with the initial loading/typing state

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Response body reader not available.');
      }

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Save the last partial line back to the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                setMessages((prev) => {
                  if (prev.length === 0) return prev;
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  const lastMsg = updated[lastIndex];
                  if (lastMsg && lastMsg.sender === 'bot') {
                    updated[lastIndex] = {
                      ...lastMsg,
                      text: lastMsg.text + parsed.text,
                    };
                  }
                  return updated;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE line:', e);
            }
          }
        }
      }

      // Read remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const parsed = JSON.parse(buffer.trim().slice(6));
          if (parsed.text) {
            setMessages((prev) => {
              if (prev.length === 0) return prev;
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              const lastMsg = updated[lastIndex];
              if (lastMsg && lastMsg.sender === 'bot') {
                updated[lastIndex] = {
                  ...lastMsg,
                  text: lastMsg.text + parsed.text,
                };
              }
              return updated;
            });
          }
        } catch (e) {
          console.error('Error parsing trailing SSE line:', e);
        }
      }

    } catch (err: any) {
      console.error('Error streaming chat:', err);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.sender === 'bot' && !lastMsg.text) {
          lastMsg.text = `⚡ Pikachu encountered an error: ${err.message || 'Could not connect to backend server.'}`;
          return updated;
        }
        return [
          ...prev,
          {
            sender: 'bot',
            text: `⚡ Pikachu encountered an error: ${err.message || 'Could not connect to backend server.'}`,
          },
        ];
      });
    } finally {
      setIsTyping(false);
      setMood('idle');
    }
  };


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(inputVal);
  };

  // Viewport Collision Avoidance logic
  const getChatPosition = () => {
    const petWidth = 75;
    const petHeight = 70;

    const chatWidth = Math.min(320, window.innerWidth - 24);
    const chatHeight = Math.min(420, window.innerHeight - 120);

    const petCenterX = position.x + petWidth / 2;
    
    // Ideal left: center-aligned with pet
    let left = petCenterX - chatWidth / 2;
    // Clamp left to screen bounds with 12px padding
    left = Math.max(12, Math.min(window.innerWidth - chatWidth - 12, left));

    // Ideal top: above the pet
    let top = position.y - chatHeight - 15;
    
    // If it goes off-screen at the top, place it below the pet instead
    if (top < 12) {
      top = position.y + petHeight + 15;
      // Clamp top if it goes off-screen at the bottom
      top = Math.max(12, Math.min(window.innerHeight - chatHeight - 12, top));
    }

    return { left, top };
  };

  const chatPosition = getChatPosition();

  return (
    <>
      {showScreenFlash && <div className="screen-flash" />}
      
      {/* ── Screen Lightning Arcs ── */}
      {lightningBolts.map((bolt) => (
        <svg 
          key={bolt.id}
          className="screen-lightning-bolt"
          viewBox="0 0 100 150"
          style={{
            top: `${bolt.top}%`,
            left: `${bolt.left}%`,
            transform: `rotate(${bolt.rotation}deg) scale(${bolt.scale})`
          }}
        >
          <polygon points="40,0 10,70 50,70 30,150 90,60 50,60" fill="#FFDE00" stroke="#FFFFFF" strokeWidth="3" />
        </svg>
      ))}

      <div 
        className="pet-widget-container"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          // Smooth transition glide during wandering, disabled during drag
          transition: isDragging ? 'none' : 'top 2.5s cubic-bezier(0.25, 1, 0.5, 1), left 2.5s cubic-bezier(0.25, 1, 0.5, 1)',
          zIndex: 9999,
          '--roll-dist': 'calc(-100vw + 100px)'
        } as React.CSSProperties}
      >
        <div 
          className={`pet-wrapper ${isDragging ? 'grabbing' : ''}`}
          onMouseDown={(e) => {
            if (petState === 'in_ball') {
              handlePokeballClick();
            } else if (petState === 'active' && !isRecallTransition) {
              handleMouseDown(e);
            }
          }}
          onTouchStart={(e) => {
            if (petState === 'in_ball') {
              handlePokeballClick();
            } else if (petState === 'active' && !isRecallTransition) {
              handleTouchStart(e);
            }
          }}
          onMouseEnter={() => {
            if (petState === 'active' && !isDragging && mood === 'idle') {
              setMood('happy');
            }
            if (petState === 'in_ball' && !showTooltip) {
              setShowTooltip(true);
            }
          }}
          onMouseLeave={() => {
            if (petState === 'active' && !isDragging && mood === 'happy') {
              setMood('idle');
            }
          }}
        >
          {showTooltip && (
            <div className="pet-tooltip">
              {petState === 'in_ball' ? "Release Pikachu! 🔴⚡" : "Drag me or Click to Chat! ⚡🐾"}
            </div>
          )}

          {/* Pikachu Speech Bubble popup */}
          {pikaSpeech && (
            <div className="pikachu-speech-bubble">
              {pikaSpeech}
            </div>
          )}

          {/* Recall Cone Beam Effect */}
          {isRecallTransition && <div className="recall-beam" />}

          {/* emerge spark particle system */}
          {emergeSparks.map(spark => (
            <div 
              key={spark.id} 
              className="emerge-spark"
              style={{
                '--angle': `${spark.angle}deg`,
                '--dist': `${spark.speed}px`,
                animationDelay: `${spark.delay}s`
              } as React.CSSProperties}
            />
          ))}

          {/* dust particles during ball roll */}
          {dustParticles.map(p => (
            <div 
              key={p.id} 
              className="dust-particle" 
              style={{ left: `${p.left}px`, top: `${p.top}px` }} 
            />
          ))}

          {/* parabolic jump spark trail */}
          {jumpSparks.map(p => (
            <div 
              key={p.id} 
              className="jump-spark" 
              style={{ left: `${p.left}px`, top: `${p.top}px` }} 
            />
          ))}

          {/* landing sparks system */}
          {landingSparks.map(spark => (
            <div 
              key={spark.id} 
              className="emerge-spark"
              style={{
                top: '80%',
                '--angle': `${spark.angle}deg`,
                '--dist': `${spark.speed}px`,
                animationDelay: `${spark.delay}s`
              } as React.CSSProperties}
            />
          ))}

          {/* landing ground impact puff */}
          {petState === 'landing' && <div className="impact-puff" />}

          {/* 1. Pokéball Render */}
          {(petState === 'in_ball' || petState === 'rolling' || petState === 'opening') && (
            <>
              <div className={`pokeball-wrapper action-${ballAction} ${
                petState === 'rolling' ? 'rolling-phase' : 
                petState === 'opening' ? 'opening-phase' : ''
              }`}>
                <div className="pokeball-top-half"></div>
                <div className="pokeball-bottom-half"></div>
                <div className="pokeball-button"></div>
                {petState === 'opening' && <div className="shockwave-ring"></div>}
              </div>
              <div className="pokeball-shadow"></div>
            </>
          )}
          
          {/* 2. Pikachu Render */}
          {(petState === 'jumping' || petState === 'landing' || petState === 'active') && (
            <div className={`cartoon-pet pikachu-pet mood-${mood} tilt-${tilt} ${isOpen ? 'chat-open' : ''} ${
              petState === 'jumping' ? 'jumping-phase' : 
              petState === 'landing' ? 'landing-phase' : 
              isRecallTransition ? 'recalling' : ''
            }`}>
              {/* Pikachu pointed ears */}
              <div className="pet-ears">
                <div className="ear-left"></div>
                <div className="ear-right"></div>
              </div>
              
              {/* Pikachu lightning tail */}
              <div className="pet-tail"></div>
              
              {/* Electric Levitation Glow underneath */}
              <div className="pet-levitate"></div>

              {/* Electric spark overlays */}
              {isSparking && (
                <div className="pikachu-sparks">
                  <span className="spark-1"></span>
                  <span className="spark-2"></span>
                  <span className="spark-3"></span>
                  <span className="spark-4"></span>
                </div>
              )}

              {/* Body containing Head & Paws */}
              <div className="pet-body">
                <div className="pet-head">
                  {/* Pikachu cheek electric pouches */}
                  <div className="pet-cheeks">
                    <span className="cheek-left"></span>
                    <span className="cheek-right"></span>
                  </div>

                  {/* Big Shiny Eyes */}
                  <div className="pet-eyes">
                    <div className="eye-left"><div className="pupil"></div></div>
                    <div className="eye-right"><div className="pupil"></div></div>
                  </div>
                  
                  {/* Cute Nose */}
                  <div className="pet-nose"></div>
                  
                  {/* Cute Pikachu Mouth */}
                  <div className="pet-mouth">
                    <span className="mouth-left"></span>
                    <span className="mouth-right"></span>
                  </div>
                </div>
                
                {/* Cute Paws */}
                <div className="pet-paws">
                  <span className="paw-left"></span>
                  <span className="paw-right"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Cyber Terminal Chat Console ── */}
        {isOpen && (
          <div className="pet-chat-window" style={{
            position: 'fixed',
            left: `${chatPosition.left}px`,
            top: `${chatPosition.top}px`,
            transformOrigin: 'center'
          }}>
            <div className="chat-header">
              <div className="header-status">
                <span className="status-dot"></span>
                <span className="status-title">Pikachu</span>
              </div>
              <div className="header-controls">
                <button 
                  className="chat-recall-btn"
                  onClick={handleRecall}
                  title="Recall Pikachu to Pokéball"
                >
                  🔴
                </button>

                <button 
                  className="chat-sound-btn" 
                  onClick={() => setIsMuted(prev => !prev)}
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                <button className="chat-close-btn" onClick={() => {
                  setIsOpen(false);
                  setMood('idle');
                }}>×</button>
              </div>
            </div>
            
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}>
                  <p>{msg.text}</p>
                  {msg.isLink && msg.linkUrl && (
                    <a href={msg.linkUrl} className="chat-link-btn">
                      Email Rohit &rarr;
                    </a>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble bot-msg">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleFormSubmit} className="chat-input-form">
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Pikachu anything about Rohit..."
                disabled={isTyping}
                className="chat-input-field"
              />
              <button 
                type="submit" 
                disabled={isTyping || !inputVal.trim()} 
                className="chat-send-btn"
                title="Send Message"
              >
                ⚡
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
