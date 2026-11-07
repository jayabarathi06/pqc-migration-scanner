import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileText,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Calendar,
  FileCode
} from 'lucide-react';
import type { ScanResult } from '../types/scan';
import { downloadPdfReport } from '../services/api';

interface Props {
  currentScan: ScanResult | null;
}

export const ReportPage: React.FC<Props> = ({ currentScan }) => {
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!currentScan) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Report Generated Yet</h2>
        <p className="text-sm text-slate-400">
          Run a codebase audit on an uploaded archive or the bundled sample project to generate an executive ReportLab PDF report.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-cyan-600 hover:bg-cyan-500 text-white text-sm shadow-md transition-colors"
        >
          Go to Upload Page
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    setErrorMsg(null);
    try {
      await downloadPdfReport(currentScan);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to generate PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  const { risk_summary, project_name, total_files_scanned } = currentScan;
  const score = risk_summary?.score ?? 0;
  const tier = risk_summary?.tier ?? 'Unknown';

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
          Executive Compliance Export
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Audit &amp; Migration PDF Report
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Download a publication-quality ReportLab PDF documenting cryptographic findings,
          NIST PQC standards mapping, and technical evidence snippets.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Report Preview Document Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Document Header Representation */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              NIST PQC Cryptographic Audit
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {project_name}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(currentScan.scanned_at || Date.now()).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-slate-500" />
                {total_files_scanned} files inspected
              </span>
            </div>
          </div>

          <div className="text-right bg-slate-950/70 border border-slate-800 p-4 rounded-2xl min-w-[140px] text-center">
            <span className="text-xs text-slate-400 block font-medium">Risk Score</span>
            <span className={`text-3xl font-extrabold ${score >= 75 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {score}
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold truncate mt-0.5">{tier}</span>
          </div>
        </div>

        {/* Content Structure Summary */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Report Sections Included in Generated PDF:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1. Executive Summary &amp; Exposure Scoring</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>2. Shor&apos;s &amp; Grover&apos;s Threat Matrices</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3. Cryptographic Findings with Line-by-Line Evidence</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>4. NIST PQC Standards Mapping (FIPS 203, 204, 205)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>5. Symmetric Cipher &amp; Hash Collision Guidance</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>6. Scan Limitations &amp; Architecture Disclaimers</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span>Ready for executive review, compliance archiving, and audit filing.</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Compiling PDF via ReportLab...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
