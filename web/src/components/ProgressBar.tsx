import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: string | number;
  className?: string;
  id?: string;
  ariaLabel?: string;
}

export function ProgressBar({
  value,
  max = 100,
  height = '10px',
  className = '',
  id,
  ariaLabel,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / Math.max(1, max)) * 100)));

  return (
    <div
      id={id}
      className={`progress-track ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
    >
      <div
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
export default ProgressBar;
