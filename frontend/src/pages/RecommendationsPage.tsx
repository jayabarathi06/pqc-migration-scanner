import React from 'react';
import {
  BookOpen,
  Key,
  FileCheck2,
  Hash,
  ShieldCheck,
  Layers,
  Lock
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Official NIST Standards
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          NIST Post-Quantum Cryptography Standards &amp; Migration Guidance
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          The National Institute of Standards and Technology (NIST) released final standards in August 2024
          to secure digital systems against quantum computing threats.
        </p>
      </div>

      {/* Standards Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FIPS 203 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-cyan-500/40 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">NIST FIPS 203</span>
              <h3 className="text-lg font-bold text-white mt-1">ML-KEM (Kyber)</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <strong>Module-Lattice-Based Key-Encapsulation Mechanism.</strong> Primary standard for general post-quantum
                encryption and key establishment. Replaces RSA key exchange and Diffie-Hellman (ECDH/DH).
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Recommended Parameter Sets:</p>
              <ul className="space-y-1 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-200">ML-KEM-768:</strong> NIST Category 3 (Balanced - Recommended)</li>
                <li><strong className="text-slate-200">ML-KEM-1024:</strong> NIST Category 5 (Maximum Assurance)</li>
                <li><strong className="text-slate-200">ML-KEM-512:</strong> NIST Category 1 (Constrained Devices)</li>
              </ul>
            </div>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-xl p-3 text-xs text-cyan-200">
            <strong>Hybrid Strategy:</strong> Pair ML-KEM-768 with classical X25519 (e.g. <code>X25519MLKEM768</code>) during transition.
          </div>
        </div>

        {/* FIPS 204 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-indigo-500/40 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase">NIST FIPS 204</span>
              <h3 className="text-lg font-bold text-white mt-1">ML-DSA (Dilithium)</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <strong>Module-Lattice-Based Digital Signature Algorithm.</strong> Primary standard for general digital
                signatures. Replaces classical RSA signatures, ECDSA, and DSA across identity tokens and PKI.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Recommended Parameter Sets:</p>
              <ul className="space-y-1 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-200">ML-DSA-65:</strong> NIST Category 3 (Recommended default)</li>
                <li><strong className="text-slate-200">ML-DSA-87:</strong> NIST Category 5 (High security)</li>
                <li><strong className="text-slate-200">ML-DSA-44:</strong> NIST Category 2 (Lower overhead)</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-3 text-xs text-indigo-200">
            <strong>Key Note:</strong> Public keys (~1.9 KB) and signatures (~3.3 KB) are larger than classical RSA/ECDSA.
          </div>
        </div>

        {/* FIPS 205 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-purple-500/40 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">NIST FIPS 205</span>
              <h3 className="text-lg font-bold text-white mt-1">SLH-DSA (SPHINCS+)</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <strong>Stateless Hash-Based Digital Signature Algorithm.</strong> Backup signature standard relying only
                on the security of cryptographic hash functions (no lattice assumptions). Ideal for firmware and archival.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Recommended Parameter Sets:</p>
              <ul className="space-y-1 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-200">SLH-DSA-SHA2-128s:</strong> Small signature variant</li>
                <li><strong className="text-slate-200">SLH-DSA-SHAKE-128f:</strong> Fast verification variant</li>
                <li><strong className="text-slate-200">SLH-DSA-SHA2-256s:</strong> Long-term archival security</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 text-xs text-purple-200">
            <strong>Use Case:</strong> Firmware verification, secure boot, and non-lattice hedge scenarios.
          </div>
        </div>
      </div>

      {/* Symmetric & Hash Guidance (Explicit Non-PQC Replacements) */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="text-xl font-bold text-white">
          Symmetric Ciphers &amp; Hash Functions: Do NOT Automatically Replace With PQC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          {/* Symmetric Ciphers */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              Symmetric Encryption (AES &amp; 3DES)
            </div>
            <p>
              Symmetric encryption algorithms are <strong>NOT</strong> broken by Shor&apos;s algorithm. Instead, Grover&apos;s
              algorithm provides a quadratic speedup for brute-force attacks, halving the effective key strength:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>
                <strong>AES-128:</strong> Provides ~64 bits of quantum security. NIST recommends upgrading to <strong>AES-256</strong>.
              </li>
              <li>
                <strong>AES-256:</strong> Retains 128 bits of security under quantum cryptanalysis, which remains impenetrable.
              </li>
              <li>
                <strong>3DES / DES:</strong> Obsolete classically and quantumly. Deprecate in favor of AES-256-GCM.
              </li>
            </ul>
            <div className="text-[11px] text-slate-500 italic pt-1">
              Do not attempt to replace AES with lattice-based PQC algorithms; symmetric ciphers require key-length adjustments only.
            </div>
          </div>

          {/* Hash Functions */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Hash className="w-4 h-4" />
              Hash Functions (MD5, SHA-1, SHA-2)
            </div>
            <p>
              Cryptographic hash functions face quantum collision attacks via the Brassard-Høyer-Tapp (BHT) algorithm,
              requiring $O(2^{'{'}n/3{'}'})$ operations instead of classical $O(2^{'{'}n/2{'}'})$ birthday bound:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>
                <strong>MD5 &amp; SHA-1:</strong> Broken by classical collision attacks today; discontinue immediately.
              </li>
              <li>
                <strong>SHA-256 &amp; SHA-384 / SHA-512:</strong> Maintain strong preimage and collision resistance against quantum computers.
              </li>
              <li>
                <strong>SHAKE-128 / SHAKE-256:</strong> Extendable-output functions (XOF) used natively in ML-KEM and SLH-DSA.
              </li>
            </ul>
            <div className="text-[11px] text-slate-500 italic pt-1">
              Hash functions do not require replacement with ML-KEM or ML-DSA; upgrade to SHA-256, SHA-384, or SHA-3.
            </div>
          </div>
        </div>
      </section>

      {/* Migration Roadmap Principles */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Recommended 4-Step Migration Strategy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-cyan-400 text-xs">
              1
            </span>
            <h4 className="font-bold text-white">Cryptographic Inventory</h4>
            <p className="text-slate-400">
              Catalogue all certificates, tokens, symmetric ciphers, and protocol endpoints across your software supply chain.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center font-bold text-indigo-400 text-xs">
              2
            </span>
            <h4 className="font-bold text-white">Adopt Hybrid Modes</h4>
            <p className="text-slate-400">
              Deploy hybrid KEMs (X25519 + ML-KEM-768) in TLS 1.3 and SSH to safeguard current traffic without sacrificing classical PKI compliance.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center font-bold text-purple-400 text-xs">
              3
            </span>
            <h4 className="font-bold text-white">Ensure Crypto-Agility</h4>
            <p className="text-slate-400">
              Decouple cryptographic algorithm selections from business logic to enable pluggable cipher swaps as libraries mature.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-400 text-xs">
              4
            </span>
            <h4 className="font-bold text-white">Upgrade Signatures</h4>
            <p className="text-slate-400">
              Prepare authentication tokens, identity providers, and certificate authorities for ML-DSA and SLH-DSA key and signature sizes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
