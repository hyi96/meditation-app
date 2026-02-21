import { useState, useEffect } from 'react';
import type { CustomPattern, BreathingPattern } from '../types';

interface CustomPatternCreatorProps {
  onPatternCreate: (pattern: CustomPattern) => void;
  onClose: () => void;
  initialPattern?: CustomPattern | BreathingPattern | null;
}

export const CustomPatternCreator = ({ onPatternCreate, onClose, initialPattern }: CustomPatternCreatorProps) => {
  const [name, setName] = useState('');
  const [inhale, setInhale] = useState(4);
  const [hold, setHold] = useState(4);
  const [exhale, setExhale] = useState(4);
  const [holdEmpty, setHoldEmpty] = useState(4);

  useEffect(() => {
    if (initialPattern) {
      setName(initialPattern.name);
      setInhale(initialPattern.inhale);
      setHold(initialPattern.hold);
      setExhale(initialPattern.exhale);
      setHoldEmpty(initialPattern.holdEmpty);
    }
  }, [initialPattern]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim()) {
      const pattern: CustomPattern = {
        // Preserve ID if editing an existing custom pattern, otherwise generate new
        id: (initialPattern && 'id' in initialPattern) ? initialPattern.id : Date.now().toString(),
        name: name.trim(),
        inhale,
        hold,
        exhale,
        holdEmpty
      };
      
      onPatternCreate(pattern);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold text-slate-100 mb-4">
          {initialPattern ? 'Edit Pattern' : 'Create Custom Pattern'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Pattern Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Pattern"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-meditation-blue focus:border-transparent placeholder:text-slate-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Inhale (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={inhale}
                onChange={(e) => setInhale(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-meditation-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Hold (seconds)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={hold}
                onChange={(e) => setHold(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-meditation-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Exhale (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={exhale}
                onChange={(e) => setExhale(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-meditation-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Hold Empty (seconds)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={holdEmpty}
                onChange={(e) => setHoldEmpty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-meditation-blue focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-center text-sm text-slate-400">
            Total cycle: {inhale + hold + exhale + holdEmpty} seconds
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-meditation-blue text-white rounded-lg hover:bg-meditation-purple transition-colors"
            >
              {initialPattern ? 'Save Changes' : 'Create Pattern'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};