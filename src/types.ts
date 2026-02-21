export interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty: number;
  cycle: number;
}

export interface CustomPattern {
  id: string;
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdEmpty: number;
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    name: "4-7-8",
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdEmpty: 0,
    cycle: 19
  },
  {
    name: "Box Breathing",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdEmpty: 4,
    cycle: 16
  },
  {
    name: "Calm Focus",
    inhale: 6,
    hold: 2,
    exhale: 8,
    holdEmpty: 2,
    cycle: 18
  },
  {
    name: "Energizing",
    inhale: 2,
    hold: 1,
    exhale: 4,
    holdEmpty: 1,
    cycle: 8
  }
];

export type MeditationPhase = 'inhale' | 'hold' | 'exhale' | 'hold-empty' | 'completed';

export interface MeditationSession {
  id: string;
  pattern: BreathingPattern;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  duration: number;
}