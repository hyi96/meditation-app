import { useState, useRef, useEffect, useCallback } from 'react';
import type { MeditationSession, MeditationPhase, BreathingPattern } from './types';

export const useMeditationTracker = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>(() => {
    try {
      const saved = localStorage.getItem('meditation-sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('meditation-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const addSession = useCallback((session: MeditationSession) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const stats = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = sessions.filter(session => 
      new Date(session.startTime) >= today
    );
    
    const totalMinutesRaw = sessions.reduce((acc, session) => acc + (session.duration / 60), 0);
    const totalDurationMinutes = Math.round(totalMinutesRaw);
    const totalDuration = {
      hours: Math.floor(totalDurationMinutes / 60),
      minutes: totalDurationMinutes % 60,
      totalMinutes: totalDurationMinutes
    };
    
    // Calculate streak
    // Sort sessions by date descending
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    let streak = 0;
    if (sortedSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastSessionDate = new Date(sortedSessions[0].startTime);
      lastSessionDate.setHours(0, 0, 0, 0);

      // If last session was today or yesterday, streak is alive
      const diffDays = (today.getTime() - lastSessionDate.getTime()) / (1000 * 3600 * 24);
      
      if (diffDays <= 1) {
        streak = 1;
        let currentDate = lastSessionDate;
        
        for (let i = 1; i < sortedSessions.length; i++) {
          const sessionDate = new Date(sortedSessions[i].startTime);
          sessionDate.setHours(0, 0, 0, 0);
          
          const dayDiff = (currentDate.getTime() - sessionDate.getTime()) / (1000 * 3600 * 24);
          
          if (dayDiff === 1) {
            streak++;
            currentDate = sessionDate;
          } else if (dayDiff > 1) {
            break;
          }
        }
      }
    }

    return {
      totalSessions: sessions.length,
      todaySessions: todaySessions.length,
      totalDuration,
      streak
    };
  })();

  return {
    addSession,
    stats
  };
};

export const useBreathingTimer = (pattern: BreathingPattern, duration: number) => {
  const [currentPhase, setCurrentPhase] = useState<MeditationPhase>('inhale');
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Ref for progress animation to keep it smooth
  const [progress, setProgress] = useState(0);
  
  // Timers refs
  const phaseStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let intervalId: number;

    if (isRunning && timeLeft > 0) {
      if (!phaseStartTimeRef.current) {
        phaseStartTimeRef.current = Date.now();
      }

      intervalId = window.setInterval(() => {
        const now = Date.now();
        
        // 1. Handle overall session timer
        setTimeLeft((prev) => {
          if (prev <= 0) {
            setIsRunning(false);
            setCurrentPhase('completed');
            return 0;
          }
          return prev - 0.1;
        });

        // 2. Handle breathing phases
        if (currentPhase !== 'completed') {
          const phaseKey = currentPhase === 'hold-empty' ? 'holdEmpty' : currentPhase;
          const phaseDuration = pattern[phaseKey as keyof typeof pattern] as number;

          if (typeof phaseDuration === 'number' && phaseDuration > 0) {
            const timeSpentInPhase = (now - (phaseStartTimeRef.current || now)) / 1000;
            const phaseProgress = Math.min((timeSpentInPhase / phaseDuration) * 100, 100);
            setProgress(phaseProgress);

            if (timeSpentInPhase >= phaseDuration) {
              // Switch phase
              phaseStartTimeRef.current = now;
              setProgress(0);

              setCurrentPhase((prev) => {
                switch (prev) {
                  case 'inhale': return pattern.hold > 0 ? 'hold' : 'exhale';
                  case 'hold': return 'exhale';
                  case 'exhale': return pattern.holdEmpty > 0 ? 'hold-empty' : 'inhale';
                  case 'hold-empty': return 'inhale';
                  default: return 'inhale';
                }
              });
            }
          } else {
            // If the phase duration is zero or undefined, skip to next phase immediately
            phaseStartTimeRef.current = now;
            setCurrentPhase((prev) => {
              switch (prev) {
                case 'inhale': return pattern.hold > 0 ? 'hold' : 'exhale';
                case 'hold': return 'exhale';
                case 'exhale': return pattern.holdEmpty > 0 ? 'hold-empty' : 'inhale';
                case 'hold-empty': return 'inhale';
                default: return 'inhale';
              }
            });
          }
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, timeLeft, pattern, currentPhase]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    phaseStartTimeRef.current = null; // Reset phase timer on pause for simplicity, or keep it for resume
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setCurrentPhase('inhale');
    setProgress(0);
    phaseStartTimeRef.current = null;
  }, [duration]);

  return {
    currentPhase,
    timeLeft: Math.ceil(timeLeft),
    isRunning,
    progress,
    start,
    pause,
    reset
  };
};

// Breathing cues: vibration or visual pulse
export const useBreathingCues = () => {
  const [enabled, setEnabled] = useState(false);
  const [pulse, setPulse] = useState(false);

  const triggerCue = useCallback(() => {
    if (!enabled) return;
    if (navigator && 'vibrate' in navigator) {
      try { navigator.vibrate(60); } catch {}
    }
    setPulse(true);
    window.setTimeout(() => setPulse(false), 400);
  }, [enabled]);

  return {
    enabled,
    pulse,
    setEnabled,
    triggerCue
  };
};
