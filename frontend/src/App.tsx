import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ReportPage } from './pages/ReportPage';
import type { ScanResult } from './types/scan';
import { getScanFromStorage, saveScanToStorage, clearScanStorage } from './services/api';

export function App() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(() => {
    return getScanFromStorage();
  });

  const handleScanComplete = (result: ScanResult) => {
    setCurrentScan(result);
    saveScanToStorage(result);
  };

  const handleClearScan = () => {
    setCurrentScan(null);
    clearScanStorage();
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar currentScan={currentScan} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage onScanComplete={handleScanComplete} />} />
            <Route path="/upload" element={<UploadPage onScanComplete={handleScanComplete} />} />
            <Route
              path="/results"
              element={<ResultsPage currentScan={currentScan} onClearScan={handleClearScan} />}
            />
            <Route path="/dashboard" element={<DashboardPage currentScan={currentScan} />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/report" element={<ReportPage currentScan={currentScan} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
