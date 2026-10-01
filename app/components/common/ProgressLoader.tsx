'use client';

interface ProgressLoaderProps {
  progress: number;
}

const ProgressLoader = ({ progress }: ProgressLoaderProps) => {
  const isComplete = progress === 100;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 flex items-center justify-center transition-opacity duration-700 ${
        isComplete ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-2 font-sans">
        <div className="w-32 h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        <span className="text-white/70 text-xs font-mono font-medium tracking-wider">
          {Math.round(clampedProgress)}%
        </span>
      </div>
    </div>
  );
};

export default ProgressLoader;
