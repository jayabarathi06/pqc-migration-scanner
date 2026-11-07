import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Zap,
  ArrowRight,
  Lock,
  Layers,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Play
} from 'lucide-react';
import { scanBundledSample } from '../services/api';
import type { ScanResult } from '../types/scan';

interface Props {
  onScanComplete: (result: ScanResult) => void;
}

export const HomePage: React.FC<Props> = ({ onScanComplete }) => {
  const navigate = useNavigate();
  const [loadingSample, setLoadingSample] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScanSample = async () => {
    setLoadingSample(true);
    setErrorMsg(null);
    try {
      const data = await scanBundledSample();
      onScanComplete(data);
      navigate('/results');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to scan sample project.');
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-8 sm:p-14 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5" />
          FIPS 203 (ML-KEM) &amp; FIPS 204 (ML-DSA) Ready
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Post-Quantum Cryptography <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Migration Scanner
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Audit source code archives for classical public-key algorithms (RSA, ECC, Diffie-Hellman)
          vulnerable to future quantum computers. Calculate exposure scores and receive NIST-standardized
          transition roadmaps.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-sm max-w-md mx-auto">
            {errorMsg}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/upload"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-950/50 transition-all flex items-center justify-center gap-2"
          >
            Start Scanning
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleScanSample}
            disabled={loadingSample}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            {loadingSample ? 'Scanning Bundled Sample...' : 'Scan Sample Project (Real Data)'}
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          * Bundled sample contains real test vectors across Python, JavaScript, and TLS configs.
        </p>
      </section>

      {/* Quantum Threat Landscape Briefing */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Must Codebases Migrate to Post-Quantum Cryptography?
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A Cryptanalytically Relevant Quantum Computer (CRQC) will break the mathematical foundations of modern internet security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Shor's */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-red-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-red-950/50 border border-red-800/40 flex items-center justify-center mb-4 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Shor&apos;s Algorithm</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Efficiently solves prime factorization and discrete logarithms in polynomial time. All classical asymmetric
              ciphers—including <strong>RSA, ECDSA, ECDH, and DSA</strong>—will provide zero bits of security.
            </p>
          </div>

          {/* Card 2: Grover's */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-950/50 border border-amber-800/40 flex items-center justify-center mb-4 text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Grover&apos;s Algorithm</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides quadratic speedup for searching unsorted databases. Reduces effective key strength of symmetric
              ciphers in half: <strong>AES-128 drops to 64-bit</strong> security, while <strong>AES-256 remains resilient at 128-bit</strong>.
            </p>
          </div>

          {/* Card 3: Harvest Now Decrypt Later */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center mb-4 text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Harvest Now, Decrypt Later</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adversaries are actively intercepting and storing encrypted network traffic today. Once a CRQC becomes operational,
              all archived classical sessions will be retroactively decrypted.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 sm:p-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          How the Migration Scanner Operates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-semibold text-white">Secure Archive Ingestion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload source archives up to 3 MB. Built-in zip-bomb filtering, path traversal protection, and in-memory cleanup.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-semibold text-white">AST &amp; Heuristic Detection</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Python parsed via concrete Abstract Syntax Trees. Polyglot heuristics inspect JS, Go, Java, TLS configs, PEM keys, and JWT headers.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-semibold text-white">NIST Recommendations &amp; PDF</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes 0–100 quantum risk scores, maps findings to FIPS 203/204/205, and exports an audit-ready executive PDF report.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="font-semibold text-white text-sm">FIPS 203 ML-KEM Guidance</h4>
          <p className="text-xs text-slate-400 mt-1">
            Replaces vulnerable RSA/ECDH key establishment with Kyber-derived lattice cryptography.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="font-semibold text-white text-sm">FIPS 204 &amp; 205 Signatures</h4>
          <p className="text-xs text-slate-400 mt-1">
            Migration strategies for ML-DSA (Dilithium) and hash-based SLH-DSA (SPHINCS+).
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <FileText className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="font-semibold text-white text-sm">ReportLab PDF Reports</h4>
          <p className="text-xs text-slate-400 mt-1">
            Generate executive and technical compliance PDFs complete with code evidence snippets.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <AlertTriangle className="w-5 h-5 text-amber-400 mb-2" />
          <h4 className="font-semibold text-white text-sm">Context-Aware Scoring</h4>
          <p className="text-xs text-slate-400 mt-1">
            Comments and test suites are automatically downgraded to prevent false alarms.
          </p>
        </div>
      </section>
    </div>
  );
};
