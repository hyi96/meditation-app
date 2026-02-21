import { BREATHING_PATTERNS } from '../types';
import type { CustomPattern, BreathingPattern } from '../types';

interface PatternSelectorProps {
  selectedPattern: BreathingPattern;
  onPatternChange: (pattern: BreathingPattern) => void;
  customPatterns: CustomPattern[];
  onCreatePattern: () => void;
  onEditPattern: (pattern: CustomPattern | BreathingPattern) => void;
  onDeletePattern: (pattern: CustomPattern) => void;
}

export const PatternSelector = ({ 
  selectedPattern, 
  onPatternChange, 
  customPatterns, 
  onCreatePattern,
  onEditPattern,
  onDeletePattern
}: PatternSelectorProps) => {
  const allPatterns = [...BREATHING_PATTERNS, ...customPatterns];

  const handlePatternClick = (pattern: BreathingPattern | CustomPattern) => {
    // If it's a CustomPattern, we need to add the cycle property to make it a BreathingPattern
    if ('cycle' in pattern) {
      onPatternChange(pattern);
    } else {
      const fullPattern: BreathingPattern = {
        ...pattern,
        cycle: pattern.inhale + pattern.hold + pattern.exhale + pattern.holdEmpty
      };
      onPatternChange(fullPattern);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Choose Breathing Pattern</h3>
        <button
          onClick={onCreatePattern}
          className="px-3 py-1 bg-meditation-blue text-white text-sm rounded-lg hover:bg-meditation-purple transition-colors"
        >
          + Custom
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
        {allPatterns.map((pattern, index) => (
          <div
            key={pattern.name}
            className={`session-card text-left p-4 transition-all duration-300 transform hover:scale-[1.02] relative group ${
              selectedPattern.name === pattern.name
                ? 'ring-2 ring-meditation-blue bg-slate-800/80 shadow-lg'
                : 'hover:bg-slate-800/70'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <button
              className="absolute inset-0 w-full h-full text-left"
              onClick={() => handlePatternClick(pattern)}
              aria-label={`Select ${pattern.name}`}
            />
            
            <div className="relative pointer-events-none">
              <div className="font-semibold text-slate-100 pr-16">{pattern.name}</div>
              <div className="text-sm text-slate-400 mt-1">
                {pattern.inhale}s inhale
                {pattern.hold > 0 ? ` • ${pattern.hold}s hold` : ''}
                {pattern.exhale > 0 ? ` • ${pattern.exhale}s exhale` : ''}
                {pattern.holdEmpty > 0 ? ` • ${pattern.holdEmpty}s hold empty` : ''}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Cycle: {'cycle' in pattern ? pattern.cycle : pattern.inhale + pattern.hold + pattern.exhale + pattern.holdEmpty}s
              </div>
            </div>

            <div className="absolute top-4 right-4 flex space-x-2 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPattern(pattern);
                }}
                className="p-1.5 text-slate-400 hover:text-meditation-blue hover:bg-slate-700 rounded-full transition-colors"
                title="Edit pattern"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              
              {'id' in pattern && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePattern(pattern as CustomPattern);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                  title="Delete pattern"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
