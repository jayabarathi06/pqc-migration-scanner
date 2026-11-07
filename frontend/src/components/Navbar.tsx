import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Upload, FileText, BarChart3, BookOpen, Download, Cpu } from 'lucide-react';
import type { ScanResult } from '../types/scan';

interface Props {
  currentScan: ScanResult | null;
}

export const Navbar: React.FC<Props> = ({ currentScan }) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-base sm:text-lg flex items-center gap-2">
              PQC Scanner
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                NIST Ready
              </span>
            </span>
            <span className="text-xs text-slate-400 block -mt-1">
              Post-Quantum Migration Tool
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/upload" className={navLinkClass}>
            <Upload className="w-4 h-4" />
            Scan ZIP
          </NavLink>
          <NavLink to="/results" className={navLinkClass}>
            <FileText className="w-4 h-4" />
            Results
            {currentScan && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                {currentScan.total_findings}
              </span>
            )}
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink to="/recommendations" className={navLinkClass}>
            <BookOpen className="w-4 h-4" />
            Standards
          </NavLink>
          <NavLink to="/report" className={navLinkClass}>
            <Download className="w-4 h-4" />
            PDF Report
          </NavLink>
        </nav>

        {/* Mobile / Quick Action */}
        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-950/50 transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Archive</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
