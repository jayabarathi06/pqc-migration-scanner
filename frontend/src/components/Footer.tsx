import React from 'react';
import { ExternalLink, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-10 mt-auto text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">
              Post-Quantum Cryptography Migration Scanner
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <a
              href="https://csrc.nist.gov/projects/post-quantum-cryptography"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              NIST PQC Standards (FIPS 203, 204, 205)
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <a
              href="https://www.cisa.gov/quantum"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              CISA Post-Quantum Initiative
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 text-center text-slate-500 leading-relaxed max-w-4xl mx-auto">
          <p>
            <strong>Methodology Disclaimer:</strong> Potential detection, not proof. Static code scanning identifies cryptographic
            algorithms, keywords, and structural patterns. It does not establish runtime execution reachability, key exchange parameters,
            or prove cryptographic resilience. Organizations must perform comprehensive architecture evaluations.
          </p>
        </div>
      </div>
    </footer>
  );
};
