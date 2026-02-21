interface DurationSelectorProps {
  duration: number;
  onDurationChange: (duration: number) => void;
}

export const DurationSelector = ({ duration, onDurationChange }: DurationSelectorProps) => {
  const durations = [1, 3, 5, 10, 15, 20, 30];

  return (
    <div className="w-full max-w-md mx-auto slide-up">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">Session Duration</h3>
      <div className="grid grid-cols-4 gap-2">
        {durations.map((min) => (
          <button
            key={min}
            onClick={() => onDurationChange(min)}
            className={`meditation-button text-sm font-medium transition-all transform hover:scale-105 ${
              duration === min
                ? 'bg-meditation-blue text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            {min}min
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <input
          type="range"
          min="1"
          max="60"
          value={duration}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-sm text-slate-400 mt-2">
          Custom: {duration} minute{duration !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};