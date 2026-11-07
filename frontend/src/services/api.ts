import axios from 'axios';
import type { ScanResult } from '../types/scan';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const STORAGE_KEY = 'pqc_scan_results';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/**
 * Upload and scan a ZIP archive.
 */
export async function uploadAndScanZip(file: File): Promise<ScanResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ScanResult>('/scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  saveScanToStorage(response.data);
  return response.data;
}

/**
 * Scan the bundled sample vulnerable application directly.
 */
export async function scanBundledSample(): Promise<ScanResult> {
  const response = await apiClient.post<ScanResult>('/scan-sample');
  saveScanToStorage(response.data);
  return response.data;
}

/**
 * Request PDF report generation from scan data and trigger browser download.
 */
export async function downloadPdfReport(scanData: ScanResult): Promise<void> {
  const response = await apiClient.post('/report', scanData, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${scanData.project_name || 'pqc_scan'}_report.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Check backend health status.
 */
export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  const response = await apiClient.get('/health');
  return response.data;
}

// SessionStorage persistence
export function saveScanToStorage(data: ScanResult): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to cache scan in sessionStorage', err);
  }
}

export function getScanFromStorage(): ScanResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ScanResult;
  } catch (err) {
    console.error('Failed to read scan from sessionStorage', err);
    return null;
  }
}

export function clearScanStorage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear scan from sessionStorage', err);
  }
}
