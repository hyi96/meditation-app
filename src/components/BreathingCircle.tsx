import { useEffect, useRef, useState } from 'react';
import type { BreathingPattern, MeditationPhase } from '../types';

interface BreathingCircleProps {
  phase: MeditationPhase;
  progress: number;
  pattern: BreathingPattern;
  isIdle?: boolean;
}

// Base gradient that will be gently hue-rotated for continuous color flow.
const BASE_GRADIENT: [string, string] = ['#5b8dff', '#a78bfa'];

const getPhaseText = (phase: MeditationPhase): string => {
  switch (phase) {
    case 'inhale': return 'Breathe In';
    case 'hold': return 'Hold';
    case 'exhale': return 'Breathe Out';
    case 'hold-empty': return 'Hold Empty';
    case 'completed': return 'Completed';
    default: return 'Ready';
  }
};

export const BreathingCircle = ({ phase, progress, pattern, isIdle = false }: BreathingCircleProps) => {
  const baseScale = 1;
  const maxScale = 1.3;
  const [hue, setHue] = useState(0);
  const targetHueRef = useRef(90);

  // Smooth, continuous hue drift so colors evolve without snapping between phases.
  useEffect(() => {
    const pickTarget = () => Math.random() * 360;
    targetHueRef.current = pickTarget();

    const id = window.setInterval(() => {
      setHue((prev) => {
        const target = targetHueRef.current;
        // Smallest angular difference (-180, 180]
        const diff = ((target - prev + 540) % 360) - 180;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), 0.6); // ~12deg/sec at 50ms tick
        const next = prev + step;

        if (Math.abs(diff) <= 1) {
          targetHueRef.current = pickTarget();
        }
        return next;
      });
    }, 50); // update ~20fps for very smooth motion

    return () => clearInterval(id);
  }, []);

  const circleScale = (() => {
    switch (phase) {
      case 'inhale':
        return baseScale + (maxScale - baseScale) * (progress / 100);
      case 'exhale':
        return maxScale - (maxScale - baseScale) * (progress / 100);
      case 'hold':
        return maxScale; // stay expanded during hold after inhale
      case 'hold-empty':
        return baseScale; // stay minimized during empty hold
      default:
        return baseScale;
    }
  })();

  const circleOpacity = 0.85 + ((circleScale - baseScale) / (maxScale - baseScale)) * 0.15;
  const [startColor, endColor] = BASE_GRADIENT;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div 
          className="breathing-circle"
          style={{
            transform: `scale(${circleScale})`,
            opacity: circleOpacity,
            background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
            filter: `hue-rotate(${hue}deg)`,
            transition: 'transform 800ms ease, opacity 800ms ease'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-1xl font-semibold">{getPhaseText(phase)}</div>
          </div>
        </div>
      </div>
      
        <div className={`text-center transition-opacity ${isIdle ? 'duration-[5000ms] opacity-0' : 'duration-[2000ms] opacity-100'}`}>
          <div className="text-lg font-semibold text-slate-200 mb-2">{pattern.name}</div>
          <div className="text-sm text-slate-400">
            {pattern.inhale}s inhale
            {pattern.hold > 0 ? ` • ${pattern.hold}s hold` : ''}
            {pattern.exhale > 0 ? ` • ${pattern.exhale}s exhale` : ''}
            {pattern.holdEmpty > 0 ? ` • ${pattern.holdEmpty}s hold empty` : ''}
          </div>
        </div>
      </div>
    );
};
