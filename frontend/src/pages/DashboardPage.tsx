import React from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Layers,
  AlertCircle
} from 'lucide-react';
import type { ScanResult } from '../types/scan';

interface Props {
  currentScan: ScanResult | null;
}

const SEVERITY_COLORS: Record<string, string> = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#06B6D4',
  Informational: '#64748B',
};

export const DashboardPage: React.FC<Props> = ({ currentScan }) => {
  if (!currentScan) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Dashboard Metrics Yet</h2>
        <p className="text-sm text-slate-400">
          Scan a project repository first to view Recharts analytics, quantum risk distributions, and priority metrics.
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

  const { risk_summary, project_name } = currentScan;
  const score = risk_summary?.score ?? 0;
  const tier = risk_summary?.tier ?? 'Unknown';

  // Format data for Severity Pie Chart
  const severityData = Object.entries(risk_summary.severity_breakdown || {}).map(
    ([name, value]) => ({
      name,
      value,
    })
  ).filter((d) => d.value > 0);

  // Format data for Algorithm Bar Chart
  const algorithmData = Object.entries(risk_summary.algorithm_breakdown || {})
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 detected algorithms

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            Analytics Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Quantum Threat Dashboard: {project_name}
          </h1>
        </div>

        <Link
          to="/results"
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-2"
        >
          View Findings Table
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Row 1: Gauge & Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Gauge Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Overall Post-Quantum Risk Score
          </h3>

          <div className="relative flex items-center justify-center">
            {/* Circular Gauge Representation */}
            <div className="w-40 h-40 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
              <div
                className={`w-36 h-36 rounded-full border-8 border-transparent border-t-current ${
                  score >= 75
                    ? 'text-red-500'
                    : score >= 40
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                } -rotate-45 transition-all`}
              />
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {score}
                </span>
                <span className="text-xs text-slate-500">out of 100</span>
              </div>
            </div>
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                score >= 75
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : score >= 40
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {tier}
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {risk_summary.calculation_explanation}
          </p>
        </div>

        {/* Posture Assessment Explanation */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Cryptographic Posture &amp; Quantum Impact
            </h3>
            <p className="text-base text-slate-200 leading-relaxed font-medium">
              {risk_summary.assessment}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-800 pt-6">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">P1 (Immediate Action)</span>
              <span className="text-2xl font-black text-red-400">
                {risk_summary.priority_breakdown?.P1 ?? 0}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Shor&apos;s Asymmetric Break</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">P2 (Plan Upgrade)</span>
              <span className="text-2xl font-black text-amber-400">
                {risk_summary.priority_breakdown?.P2 ?? 0}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Legacy Ciphers / Hashes</span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">P3 (Review &amp; Agility)</span>
              <span className="text-2xl font-black text-purple-400">
                {risk_summary.priority_breakdown?.P3 ?? 0}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Post-Quantum Resilient / Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution Donut */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            Findings by Risk Severity Level
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={SEVERITY_COLORS[entry.name] || '#64748B'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Algorithm Frequency Bar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Top Cryptographic Algorithms Detected
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={algorithmData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Limitations Disclaimer Box */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Scan Limitations &amp; Scope
        </h4>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          {risk_summary.limitations?.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
