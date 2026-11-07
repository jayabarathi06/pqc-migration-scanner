import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  FileCode,
  ArrowRight,
  Download,
  ChevronRight,
  Trash2
} from 'lucide-react';
import type { ScanResult, Finding } from '../types/scan';
import { SeverityBadge } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';

interface Props {
  currentScan: ScanResult | null;
  onClearScan: () => void;
}

export const ResultsPage: React.FC<Props> = ({ currentScan, onClearScan }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  // If no scan exists in memory or sessionStorage
  if (!currentScan) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <FileCode className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Scan Results Loaded</h2>
        <p className="text-sm text-slate-400">
          Upload a project archive or scan the bundled sample codebase to see cryptographic detections and NIST migration advice.
        </p>
        <div className="pt-2">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-cyan-600 hover:bg-cyan-500 text-white text-sm shadow-md transition-colors"
          >
            Go to Upload Page
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { risk_summary, findings, project_name, total_files_scanned } = currentScan;
  const score = risk_summary?.score ?? 0;
  const tier = risk_summary?.tier ?? 'Unknown';

  // Extract unique algorithm names and languages for filters
  const uniqueAlgorithms = useMemo(() => {
    const algos = new Set<string>();
    findings.forEach((f) => algos.add(f.algorithm));
    return Array.from(algos).sort();
  }, [findings]);

  const uniqueLanguages = useMemo(() => {
    const langs = new Set<string>();
    findings.forEach((f) => langs.add(f.language));
    return Array.from(langs).sort();
  }, [findings]);

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // Severity filter
      if (selectedSeverity !== 'All' && f.risk !== selectedSeverity) {
        return false;
      }
      // Algorithm filter
      if (selectedAlgorithm !== 'All' && f.algorithm !== selectedAlgorithm) {
        return false;
      }
      // Language filter
      if (selectedLanguage !== 'All' && f.language !== selectedLanguage) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAlgo = f.algorithm.toLowerCase().includes(query);
        const matchesFile = f.file_path.toLowerCase().includes(query);
        const matchesSnippet = f.evidence_snippet.toLowerCase().includes(query);
        const matchesRec = f.recommendation.toLowerCase().includes(query);
        if (!matchesAlgo && !matchesFile && !matchesSnippet && !matchesRec) {
          return false;
        }
      }
      return true;
    });
  }, [findings, selectedSeverity, selectedAlgorithm, selectedLanguage, searchQuery]);

  return (
    <div className="space-y-8 py-6">
      {/* Header and Project Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Audit Target
            </span>
            <span className="text-xs text-slate-400">
              Scanned on {new Date(currentScan.scanned_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            {project_name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClearScan}
            title="Clear stored results and reset audit"
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <Link
            to="/report"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            PDF Report
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-2"
          >
            Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quantum Risk Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${score >= 75 ? 'text-red-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {score}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <span className="text-xs font-medium text-slate-300 block truncate">
            {tier}
          </span>
        </div>

        {/* High Risk Findings */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            High Risk (Shor&apos;s Threat)
          </span>
          <div className="text-3xl font-black text-red-400">
            {risk_summary?.severity_breakdown?.High ?? 0}
          </div>
          <span className="text-xs text-slate-500 block">
            Priority 1 (Immediate Migration)
          </span>
        </div>

        {/* Medium & Low */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Medium / Low Risk
          </span>
          <div className="text-3xl font-black text-amber-400">
            {(risk_summary?.severity_breakdown?.Medium ?? 0) + (risk_summary?.severity_breakdown?.Low ?? 0)}
          </div>
          <span className="text-xs text-slate-500 block">
            Grover&apos;s &amp; Legacy Hashes
          </span>
        </div>

        {/* Files Scanned */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Codebase Coverage
          </span>
          <div className="text-3xl font-black text-white">
            {total_files_scanned}
          </div>
          <span className="text-xs text-slate-500 block">
            {findings.length} Total Candidate Matches
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by algorithm, file path, evidence snippet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Severities</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
              <option value="Informational">Informational</option>
            </select>

            {/* Algorithm Dropdown */}
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-cyan-500 max-w-[150px]"
            >
              <option value="All">All Algorithms</option>
              {uniqueAlgorithms.map((algo) => (
                <option key={algo} value={algo}>
                  {algo}
                </option>
              ))}
            </select>

            {/* Language Dropdown */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Languages</option>
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>
            Showing <strong className="text-white">{filteredFindings.length}</strong> of{' '}
            <strong className="text-white">{findings.length}</strong> detected items
          </span>
          {(selectedSeverity !== 'All' || selectedAlgorithm !== 'All' || selectedLanguage !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSeverity('All');
                setSelectedAlgorithm('All');
                setSelectedLanguage('All');
                setSearchQuery('');
              }}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">ID &amp; Algorithm</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Risk Severity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">NIST Recommendation</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No cryptographic findings match your current search criteria.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => setActiveFinding(finding)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Algorithm */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {finding.id}
                        </span>
                        <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {finding.algorithm}
                        </span>
                      </div>
                    </td>

                    {/* File Path & Line */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 truncate max-w-xs" title={`${finding.file_path}:${finding.line}`}>
                        <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{finding.file_path}</span>
                        <span className="text-cyan-400">:{finding.line}</span>
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="py-3.5 px-4 capitalize text-slate-300 text-xs">
                      {finding.purpose}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={finding.risk} />
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-medium bg-slate-800 text-purple-300 border border-purple-900/40">
                        {finding.migration_priority}
                      </span>
                    </td>

                    {/* Recommendation Snippet */}
                    <td className="py-3.5 px-4 max-w-xs text-xs text-slate-400 truncate" title={finding.recommendation}>
                      {finding.recommendation}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFinding(finding);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium transition-colors"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      <FindingDrawer
        finding={activeFinding}
        onClose={() => setActiveFinding(null)}
      />
    </div>
  );
};
