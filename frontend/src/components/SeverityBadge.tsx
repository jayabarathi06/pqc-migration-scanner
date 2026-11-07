import React from 'react';
import type { SeverityLevel } from '../types/scan';

interface Props {
  severity: SeverityLevel;
}

export const SeverityBadge: React.FC<Props> = ({ severity }) => {
  const getStyles = () => {
    switch (severity) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Informational':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {severity}
    </span>
  );
};
