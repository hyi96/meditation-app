import { useMeditationTracker } from '../hooks';
import { MeditationSession } from './MeditationSession';
import { PatternSelector } from './PatternSelector';
import { DurationSelector } from './DurationSelector';
import { BREATHING_PATTERNS } from '../types';
import type { BreathingPattern, CustomPattern, MeditationSession as MeditationSessionType } from '../types';
import { CustomPatternCreator } from './CustomPatternCreator';
import { useState, useEffect } from 'react';

export const MeditationApp = () => {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0]);
  const [duration, setDuration] = useState(5);
  const [isInSession, setIsInSession] = useState(false);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [editingPattern, setEditingPattern] = useState<CustomPattern | BreathingPattern | null>(null);
  
  const { addSession, stats } = useMeditationTracker();
  
  const [customPatterns, setCustomPatterns] = useState<CustomPattern[]>(() => {
    try {
      const savedPatterns = localStorage.getItem('custom-breathing-patterns');
      return savedPatterns ? JSON.parse(savedPatterns) : [];
    } catch (error) {
      console.error('Error loading custom patterns:', error);
      return [];
    }
  });

  // Save custom patterns to localStorage when they change
  useEffect(() => {
    localStorage.setItem('custom-breathing-patterns', JSON.stringify(customPatterns));
  }, [customPatterns]);

  const handleCreateOrUpdatePattern = (pattern: CustomPattern) => {
    setCustomPatterns(prev => {
      const existingIndex = prev.findIndex(p => p.id === pattern.id);
      if (existingIndex >= 0) {
        // Update existing
        const newPatterns = [...prev];
        newPatterns[existingIndex] = pattern;
        return newPatterns;
      }
      // Add new
      return [...prev, pattern];
    });

    const fullPattern: BreathingPattern = {
      ...pattern,
      cycle: pattern.inhale + pattern.hold + pattern.exhale + pattern.holdEmpty
    };
    setSelectedPattern(fullPattern);
    setShowCustomCreator(false);
    setEditingPattern(null);
  };

  const handleEditPattern = (pattern: CustomPattern | BreathingPattern) => {
    setEditingPattern(pattern);
    setShowCustomCreator(true);
  };

  const handleDeletePattern = (pattern: CustomPattern) => {
    if (confirm(`Are you sure you want to delete "${pattern.name}"?`)) {
      setCustomPatterns(prev => prev.filter(p => p.id !== pattern.id));
      // If the deleted pattern was selected, revert to default
      if (selectedPattern.name === pattern.name) {
        setSelectedPattern(BREATHING_PATTERNS[0]);
      }
    }
  };

  const startSession = () => {
    setIsInSession(true);
  };

  const completeSession = (elapsedSeconds: number) => {
    const session: MeditationSessionType = {
      id: Date.now().toString(),
      pattern: selectedPattern,
      startTime: new Date(),
      endTime: new Date(),
      completed: true,
      duration: elapsedSeconds
    };
    addSession(session);
    setIsInSession(false);
  };

  if (isInSession) {
    return (
      <MeditationSession
        pattern={selectedPattern}
        duration={duration}
        onComplete={completeSession}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-50 mb-2 drop-shadow">Mindful Breathing</h1>
          <p className="text-slate-300">Find your calm through guided breathing exercises</p>
        </header>


          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-in">
            <div className="session-card text-center transform hover:scale-105 transition-all">
              <div className="text-2xl font-bold text-meditation-blue">{stats.totalSessions}</div>
              <div className="text-sm text-slate-400">Total Sessions</div>
            </div>
            <div className="session-card text-center transform hover:scale-105 transition-all">
              <div className="text-2xl font-bold text-meditation-purple">{stats.todaySessions}</div>
              <div className="text-sm text-slate-400">Today</div>
            </div>
            <div className="session-card text-center transform hover:scale-105 transition-all">
              <div className="text-2xl font-bold text-meditation-pink">
                {stats.totalDuration.hours}h {stats.totalDuration.minutes}m
              </div>
              <div className="text-sm text-slate-400">Total Time</div>
            </div>
            <div className={`session-card text-center transform hover:scale-105 transition-all ${stats.streak > 0 ? 'streak-glow' : ''}`}>
              <div className="text-2xl font-bold text-meditation-teal">{stats.streak}🔥</div>
              <div className="text-sm text-slate-400">Day Streak</div>
            </div>
          </div>

        <div className="grid md:grid-cols-2 gap-8 slide-up">
          <div className="transform hover:scale-[1.02] transition-all">
            <PatternSelector
              selectedPattern={selectedPattern}
              onPatternChange={setSelectedPattern}
              customPatterns={customPatterns}
              onCreatePattern={() => {
                setEditingPattern(null);
                setShowCustomCreator(true);
              }}
              onEditPattern={handleEditPattern}
              onDeletePattern={handleDeletePattern}
            />
          </div>
          
          <div className="transform hover:scale-[1.02] transition-all">
            <DurationSelector
              duration={duration}
              onDurationChange={setDuration}
            />
          </div>
        </div>

        {/* Start button */}
        <div className="text-center mt-8 fade-in">
          <button
            onClick={startSession}
            className="px-12 py-4 bg-gradient-to-r from-meditation-blue to-meditation-purple text-white text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 pulse-gentle"
          >
            Begin Meditation
          </button>
        </div>

        {/* Custom Pattern Creator Modal */}
        {showCustomCreator && (
          <CustomPatternCreator
            onPatternCreate={handleCreateOrUpdatePattern}
            onClose={() => {
              setShowCustomCreator(false);
              setEditingPattern(null);
            }}
            initialPattern={editingPattern}
          />
        )}

        {/* Tips section */}
        <div className="mt-8 session-card">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">Breathing Tips</h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li>• Find a comfortable seated position with good posture</li>
            <li>• Place one hand on your chest and one on your belly</li>
            <li>• Breathe slowly and deeply through your nose</li>
            <li>• Let your thoughts come and go without judgment</li>
            <li>• Be gentle with yourself - this is a practice, not perfection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
