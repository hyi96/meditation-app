import { useEffect, useRef, useState, useCallback } from 'react';
import { useBreathingTimer } from '../hooks';
import { BreathingCircle } from './BreathingCircle';
import type { BreathingPattern } from '../types';

const IDLE_TIMEOUT_MS = 60_000; // 1 minute

interface MeditationSessionProps {
  pattern: BreathingPattern;
  duration: number;
  onComplete: (elapsedSeconds: number) => void;
}

export const MeditationSession = ({ pattern, duration, onComplete }: MeditationSessionProps) => {
  const { currentPhase, timeLeft, isRunning, progress, start, pause, reset } = useBreathingTimer(pattern, duration);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    resetIdleTimer();
    const handleMouseMove = () => resetIdleTimer();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = duration * 60;
  // Calculate elapsed time properly based on current timeLeft state
  // If completed, timeLeft is 0, so elapsed is totalTime
  // If not completed, elapsed is totalTime - timeLeft
  const elapsed = currentPhase === 'completed' ? totalTime : Math.max(0, totalTime - timeLeft);
  const isCompleted = currentPhase === 'completed' || timeLeft <= 0;
  
  const sessionProgress = (elapsed / totalTime) * 100;
  const hasStarted = timeLeft < totalTime || isRunning;
  
  const handleComplete = () => {
    onComplete(elapsed);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-8 fade-in">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-slate-50">Namaste</h2>
            <p className="text-xl text-slate-300">Session Complete</p>
          </div>
          
          <div className="session-card p-8 rounded-3xl transform transition-all hover:scale-105 duration-300">
            <p className="text-slate-400 mb-2 text-sm uppercase tracking-wide font-semibold">Total Time</p>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-meditation-blue to-meditation-purple">
              {formatTime(elapsed)}
            </p>
          </div>

          <button
            onClick={handleComplete}
            className="w-full meditation-button px-8 py-4 text-lg font-bold bg-meditation-blue text-white hover:bg-meditation-purple transition-all shadow-lg hover:shadow-xl rounded-xl transform hover:-translate-y-1"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isIdle ? 'cursor-none' : ''}`}>
      <div className="w-full max-w-4xl">
        {/* Progress bar moved higher */}
        <div className={`mb-10 -mt-6 transition-opacity ${isIdle ? 'duration-[5000ms] opacity-0 pointer-events-none' : 'duration-[2000ms] opacity-100'}`}>
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{formatTime(elapsed)} / {formatTime(totalTime)}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-meditation-blue to-meditation-purple h-2 rounded-full transition-all duration-1000"
              style={{ width: `${sessionProgress}%` }}
            />
          </div>
        </div>

        {/* Main breathing circle */}
        <div className="mb-8">
          <BreathingCircle 
            phase={currentPhase}
            progress={progress}
            pattern={pattern}
            isIdle={isIdle}
          />
        </div>


        {/* Controls */}
        <div className={`flex justify-center space-x-4 transition-opacity ${isIdle ? 'duration-[5000ms] opacity-0 pointer-events-none' : 'duration-[2000ms] opacity-100'}`}>
            {!isRunning ? (
              <button
                onClick={start}
                className="meditation-button px-8 py-3 text-lg font-semibold bg-meditation-blue text-white hover:bg-meditation-purple transition-all"
              >
                {timeLeft < duration * 60 ? 'Resume' : 'Start Session'}
              </button>
            ) : (
              <button
                onClick={pause}
                className="meditation-button px-8 py-3 text-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all"
              >
                Pause
              </button>
            )}
            
            <button
              onClick={reset}
              className="meditation-button px-8 py-3 text-lg font-semibold text-slate-300 hover:bg-slate-700 transition-all"
            >
              Reset
            </button>
        </div>

         {/* Exit button */}
         <div className={`mt-6 text-center transition-opacity ${isIdle ? 'duration-[5000ms] opacity-0 pointer-events-none' : 'duration-[2000ms] opacity-100'}`}>
           <button
             onClick={handleComplete}
             className="text-gray-500 hover:text-gray-300 text-sm underline transition-colors"
           >
             {hasStarted ? 'End Session Early' : 'Return to Home'}
           </button>
         </div>

        {/* Session info */}
        <div className={`mt-8 text-center transition-opacity ${isIdle ? 'duration-[5000ms] opacity-0 pointer-events-none' : 'duration-[2000ms] opacity-100'}`}>
          <div className="text-sm text-slate-400">
            Current cycle: {currentPhase}
          </div>
        </div>
      </div>
    </div>
  );
};
