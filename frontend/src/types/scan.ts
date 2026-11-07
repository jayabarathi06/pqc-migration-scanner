export type SeverityLevel = 'High' | 'Medium' | 'Low' | 'Informational';
export type MigrationPriority = 'P1' | 'P2' | 'P3';
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface Finding {
  id: string;
  algorithm: string;
  file_path: string;
  line: number;
  evidence_snippet: string;
  purpose: string;
  confidence: ConfidenceLevel;
  risk: SeverityLevel;
  risk_explanation: string;
  recommendation: string;
  migration_priority: MigrationPriority;
  language: string;
  support_level: string;
  disclaimer: string;
}

export interface RiskSummary {
  score: number;
  tier: string;
  assessment: string;
  calculation_explanation: string;
  severity_breakdown: {
    High: number;
    Medium: number;
    Low: number;
    Informational: number;
  };
  priority_breakdown: {
    P1: number;
    P2: number;
    P3: number;
  };
  algorithm_breakdown: Record<string, number>;
  total_findings: number;
  limitations: string[];
}

export interface ScanResult {
  status: string;
  project_name: string;
  scanned_at?: string;
  total_files_scanned: number;
  total_findings: number;
  risk_summary: RiskSummary;
  findings: Finding[];
  disclaimer: string;
}

