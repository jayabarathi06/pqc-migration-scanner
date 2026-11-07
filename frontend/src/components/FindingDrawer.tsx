import React from 'react';
import { X, ShieldAlert, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Finding } from '../types/scan';
import { SeverityBadge } from './SeverityBadge';

interface Props {
  finding: Finding | null;
  onClose: () => void;
}

export const FindingDrawer: React.FC<Props> = ({ finding, onClose }) => {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {finding.id}
              </span>
              <SeverityBadge severity={finding.risk} />
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-800/40">
                Priority: {finding.migration_priority}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {finding.algorithm}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-6 flex-1 text-sm text-slate-300">
          {/* File location info */}
          <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-mono text-xs truncate max-w-md">
                {finding.file_path}:{finding.line}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Confidence: <strong className="text-white">{finding.confidence}</strong></span>
              <span>Engine: <strong className="text-white">{finding.support_level}</strong></span>
            </div>
          </div>

          {/* Evidence Snippet rendered safely as plain text */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              Code Context Snippet (Plain Text)
            </h3>
            <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 overflow-x-auto">
              <pre className="font-mono text-xs text-cyan-300 whitespace-pre leading-relaxed select-text">
                {finding.evidence_snippet}
              </pre>
            </div>
          </div>

          {/* Threat Explanation */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Quantum Threat Explanation
            </h3>
            <p className="bg-red-950/20 border border-red-900/30 rounded-lg p-3.5 text-red-200/90 leading-relaxed">
              {finding.risk_explanation}
            </p>
          </div>

          {/* NIST Recommendation */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              NIST PQC Migration Guidance
            </h3>
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3.5 text-emerald-200/90 leading-relaxed">
              {finding.recommendation}
            </div>
          </div>

          {/* Purpose & Context */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Identified Purpose:</span>
              <span className="font-semibold text-white capitalize">{finding.purpose}</span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Language Ecosystem:</span>
              <span className="font-semibold text-white capitalize">{finding.language}</span>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="border-t border-slate-800 pt-4 text-xs text-slate-500 italic flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500/70 shrink-0 mt-0.5" />
            <span>{finding.disclaimer}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
